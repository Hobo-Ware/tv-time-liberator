import { jwtDecode } from "jwt-decode";
import createEta from "simple-eta";
import {
    favoriteList,
    followedMovies,
    followedShows,
    myLists,
} from "../../core/api";
import { setCache } from "../../core/http";
import { setAuthorizationHeader } from "../../core/http/setAuthorizationHeader";
import { toCsv } from "../../core/serializer/toCsv";
import type { ProgressReport } from "../../core/utils/ProgressReporter";
import { imdb as imdbResolver } from "./request/emissions/imdb";
import { emit } from "./request/emitter/emit";
import { listener } from "./request/listener/listener";
import { Topic } from "./request/topic/Topic";
import { LocalStore } from "./store";
import { download, downloadZip } from "./utils/download";

console.log("--- TV Time Liberator Loaded ---");

function readUser(): { id: string; login: string; name: string } | null {
    const raw = localStorage.getItem("flutter.user");
    if (!raw) return null;
    try {
        return JSON.parse(JSON.parse(raw));
    } catch {
        return null;
    }
}

function readToken(): string {
    const raw = localStorage.getItem("flutter.jwtToken");
    // Stored JSON-quoted ("eyJ..."); strip quotes if present without
    // corrupting an unquoted token.
    return raw ? raw.replace(/^"|"$/g, "") : "";
}

// Work distribution across [movies, shows, favorites, lists]. Shows dominate
// (per-episode work), so weighting the overall fraction by real cost - rather
// than treating each phase as an equal 25% - is what keeps the ETA honest.
const PHASE_WEIGHTS = [0.05, 0.80, 0.07, 0.08];
const WEIGHT_BEFORE = PHASE_WEIGHTS.reduce<number[]>(
    (acc, w, i) => [...acc, (acc[i] ?? 0) + w],
    [0],
);
const PHASE_COUNT = PHASE_WEIGHTS.length;
let extracting = false;

let reportSnapshot: ProgressReport = {
    total: NaN,
    estimated: NaN,
    value: {
        current: NaN,
        previous: NaN,
    },
    message: "",
};
emit(Topic.Progress, reportSnapshot);

async function extract(format: 'zip' | 'files' = 'zip', includeEpisodeRatings = false) {
    const user = readUser();
    if (!user?.id && !user?.login) {
        throw new Error('Could not read your TV Time profile. Refresh the page and try again.');
    }
    setAuthorizationHeader(readToken());
    setCache(LocalStore);

    console.log("Extracting...");

    // Each phase reports its own 0..1 fraction; map it into one continuous
    // 0..1 bar across all phases so progress never resets backward.
    let phaseIndex = 0;
    // One estimator over the whole export (not per-phase), fed the work-weighted
    // overall fraction so the ETA reflects total remaining work, not the current
    // phase in isolation.
    const eta = createEta({ min: 0, max: 1, historyTimeConstant: 20 });
    const config = {
        userId: user.id ?? user.login,
        imdbResolver,
        includeEpisodeRatings,
        onProgress: (report: ProgressReport) => {
            const frac = Number.isFinite(report.value?.current) ? report.value.current : 0;
            const overall = Math.min(
                1,
                (WEIGHT_BEFORE[phaseIndex] ?? 0) + (PHASE_WEIGHTS[phaseIndex] ?? 0) * frac,
            );

            eta.report(overall);
            const seconds = eta.estimate();
            // Suppress the estimate until there's real signal, so users never
            // see an optimistic "a few seconds" during the fast opening phase.
            const estimated = overall > 0.03 && Number.isFinite(seconds)
                ? Math.round(seconds)
                : Infinity;

            reportSnapshot = {
                ...report,
                value: { current: overall, previous: reportSnapshot.value?.current ?? 0 },
                estimated,
            };
            emit(Topic.Progress, reportSnapshot);
        },
    };

    // Serialize each dataset as soon as it lands, then drop the object graph
    // so peak heap holds strings - not the full object trees + strings + zip
    // all at once. The shows graph (seasons/episodes) is the heaviest, so
    // freeing it before favorites/lists/zip is what keeps big libraries alive.
    const files: Record<string, string> = {};

    let movies = await followedMovies(config); phaseIndex = 1;
    let shows = await followedShows(config); phaseIndex = 2;
    files["movies.json"] = JSON.stringify(movies, null, 2);
    files["shows.json"] = JSON.stringify(shows, null, 2);
    files["activity_history.csv"] = toCsv({ movies, shows });
    movies = [];
    shows = [];

    let favorites = await favoriteList(config); phaseIndex = 3;
    files["favorites.json"] = JSON.stringify(favorites, null, 2);
    files["favorites.csv"] = toCsv(favorites);
    favorites = { name: '', description: '', is_public: true, movies: [], shows: [] };

    const lists = await myLists(config); phaseIndex = 4;
    files["lists.json"] = JSON.stringify(lists, null, 2);
    for (const list of lists) {
        const listFilename = `list_${list.name.toLowerCase().replace(/ /g, "_")}.csv`;
        files[listFilename] = toCsv({ movies: list.movies, shows: list.shows });
    }

    if (format === 'zip') {
        downloadZip(files);
    } else {
        for (const [filename, content] of Object.entries(files)) {
            download(filename, content);
        }
    }
}

function isAuthorized(): boolean {
    // Gate on the JWT (what actually authorizes API calls), not the fragile
    // user blob. TV Time changing the shape of `flutter.user` was locking
    // logged-in users out behind a permanently greyed button.
    const token = readToken();
    if (!token) {
        return false;
    }

    try {
        const { exp } = jwtDecode<{ exp?: number }>(token);
        return exp == null || exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

listener(Topic.Export, async ({ format, includeEpisodeRatings }) => {
    // Guard against double-clicks: a second concurrent extraction doubles
    // memory + API load and crashed the tab in earlier versions.
    if (extracting) {
        return;
    }
    extracting = true;

    // Emit immediately so the popup flips to "in progress" the instant the
    // button is clicked, instead of sitting silent until the first page loads.
    reportSnapshot = {
        value: { current: 0, previous: 0 },
        estimated: Infinity,
        total: PHASE_COUNT,
        message: 'Starting liberation...',
    };
    emit(Topic.Progress, reportSnapshot);

    try {
        await extract(format, includeEpisodeRatings);
        reportSnapshot = {
            ...reportSnapshot,
            done: true,
            error: false,
            value: { current: 1, previous: reportSnapshot.value?.current ?? 0 },
            message: 'All done! Your data is free.',
            estimated: 0,
        };
        emit(Topic.Progress, reportSnapshot);
    } catch (error) {
        console.error(error);
        reportSnapshot = {
            ...reportSnapshot,
            done: false,
            error: true,
            message: 'Something went wrong. Refresh TV Time and try again.',
            estimated: 0,
        };
        emit(Topic.Progress, reportSnapshot);
    } finally {
        extracting = false;
    }
});

listener(Topic.CheckAuthorization, () => {
    return isAuthorized();
});

listener(Topic.CurrentProgress, () => {
    return reportSnapshot;
});

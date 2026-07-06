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
    return localStorage.getItem("flutter.jwtToken")?.slice(1, -1) ?? "";
}

const PHASE_COUNT = 4;
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

async function extract(format: 'zip' | 'files' = 'zip') {
    const user = readUser()!;
    setAuthorizationHeader(readToken());
    setCache(LocalStore);

    console.log("Extracting...");

    // Each phase reports its own 0..1 fraction; map it into one continuous
    // 0..1 bar across all phases so progress never resets backward.
    let phaseIndex = 0;
    const config = {
        userId: user.id ?? user.login,
        imdbResolver,
        onProgress: (report: ProgressReport) => {
            const frac = Number.isFinite(report.value?.current) ? report.value.current : 0;
            const overall = Math.min(1, (phaseIndex + frac) / PHASE_COUNT);
            reportSnapshot = {
                ...report,
                value: { current: overall, previous: reportSnapshot.value?.current ?? 0 },
            };
            emit(Topic.Progress, reportSnapshot);
        },
    };

    const movies = await followedMovies(config); phaseIndex = 1;
    const shows = await followedShows(config); phaseIndex = 2;
    const favorites = await favoriteList(config); phaseIndex = 3;
    const lists = await myLists(config); phaseIndex = 4;

    const files: Record<string, string> = {
        "movies.json": JSON.stringify(movies, null, 2),
        "shows.json": JSON.stringify(shows, null, 2),
        "activity_history.csv": toCsv({ movies, shows }),
        "favorites.json": JSON.stringify(favorites, null, 2),
        "favorites.csv": toCsv(favorites),
        "lists.json": JSON.stringify(lists, null, 2),
    };

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
    const user = readUser();
    return !!user?.name && user.name !== "Anonymous";
}

listener(Topic.Export, async ({ format }) => {
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
        await extract(format);
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

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
import { download } from "./utils/download";

console.log("--- TV Time Liberator Loaded ---");

function readUser(): { id: string; login: string; name: string } {
    return JSON.parse(JSON.parse(localStorage.getItem("flutter.user")!));
}

function readToken(): string {
    return localStorage.getItem("flutter.jwtToken")!.slice(1, -1);
}

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

async function extract() {
    const user: { login: string, id: string } = readUser();
    setAuthorizationHeader(readToken());
    setCache(LocalStore);

    console.log("Extracting...");

    const config = {
        userId: user.id ?? user.login,
        imdbResolver,
        onProgress: (report: ProgressReport) => {
            reportSnapshot = report;
            emit(Topic.Progress, report);
        },
    };

    const movies = await followedMovies(config);

    download("movies.json", JSON.stringify(movies, null, 2));

    const shows = await followedShows(config);
    download("shows.json", JSON.stringify(shows, null, 2));

    download("activity_history.csv", toCsv({ movies, shows }));

    const favorites = await favoriteList(config);
    download("favorites.json", JSON.stringify(favorites, null, 2));
    download("favorites.csv", toCsv(favorites));

    const lists = await myLists(config);
    download("lists.json", JSON.stringify(lists, null, 2));
    for (const list of lists) {
        const listFilename = `list_${
            list.name.toLowerCase().replace(/ /g, "_")
        }.csv`;
        download(
            listFilename,
            toCsv({
                movies: list.movies,
                shows: list.shows,
            }),
        );
    }
}

function isAuthorized(): boolean {
    const user = readUser();
    return !!user.name && user.name !== "Anonymous";
}

listener(Topic.Export, async () => {
    await extract()
        .then(() => {
            reportSnapshot = {
                ...reportSnapshot,
                done: true,
                value: { current: 1, previous: reportSnapshot.value?.current ?? 0 },
                message: 'All done! Your data is free.',
                estimated: 0,
            };
            emit(Topic.Progress, reportSnapshot);
        })
        .catch(console.error);
});

listener(Topic.CheckAuthorization, () => {
    return isAuthorized();
});

listener(Topic.CurrentProgress, () => {
    return reportSnapshot;
});

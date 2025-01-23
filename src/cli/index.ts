import {
    favoriteList,
    followedMovies,
    followedShows,
    myLists,
} from "../core/api";
import { mkdir, writeFile } from "fs/promises";
import { login } from "./login";
import { setAuthorizationHeader } from "../core/http/setAuthorizationHeader";
import { setCache } from "../core/http";
import { PersistentStore } from "./store";
import { Presets, SingleBar } from "cli-progress";
import { toCsv } from "../core/serializer/toCsv";
import { TV_TIME_USERNAME, USERNAME_HASH } from "./env/TV_TIME_USERNAME";
import { TV_TIME_PASSWORD } from "./env/TV_TIME_PASSWORD";

const reporter = new SingleBar({
    format:
        "{bar} {percentage}% | {category} \t| ETA: {estimated}s | {message} ",
    autopadding: true,
    barCompleteChar: "\u2588",
}, Presets.shades_classic);

const { userId, token } = await login(TV_TIME_USERNAME, TV_TIME_PASSWORD);

setAuthorizationHeader(token);
setCache(
    await PersistentStore.create(PersistentStore.namespacedPath(USERNAME_HASH)),
);

const exportDir = `.export/${USERNAME_HASH}`;
try {
    await mkdir(exportDir, { recursive: true });
} catch (error) {
    if (error.code !== "EEXIST") {
        throw error;
    }
}

const configFactory = (category = "") => {
    reporter.start(1, 0, { category, ...reporterDefaultPayload });

    return {
        userId,
        onProgress: ({ value: { current }, message, estimated }) => {
            reporter.update(current, { message, estimated });

            if (current === 1) {
                reporter.stop();
            }
        },
    };
};

const reporterDefaultPayload = {
    estimated: 0,
    message: "",
};

const userDirectory = (filename: string) => {
    return `${exportDir}/${filename}`;
};

const movies = await followedMovies(configFactory("Movies"));
await writeFile(userDirectory("movies.json"), JSON.stringify(movies, null, 4));

const shows = await followedShows(configFactory("Series"));
await writeFile(userDirectory("shows.json"), JSON.stringify(shows, null, 4));
await writeFile(
    userDirectory("watchlist.csv"),
    toCsv({
        movies,
        shows,
    }),
);

const favorites = await favoriteList(configFactory("Faves"));
await writeFile(
    userDirectory("favorites.json"),
    JSON.stringify(favorites, null, 2),
);
await writeFile(userDirectory("favorites.csv"), toCsv(favorites));

const lists = await myLists(configFactory("Lists"));
await writeFile(userDirectory("lists.json"), JSON.stringify(lists, null, 2));
for (const list of lists) {
    const listFilename = `list_${
        list.name.toLowerCase().replace(/ /g, "_")
    }.csv`;
    await writeFile(
        userDirectory(listFilename),
        toCsv({
            movies: list.movies,
            shows: list.shows,
        }),
    );
}
process.exit(0);

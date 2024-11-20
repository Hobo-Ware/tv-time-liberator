import { Movie } from "../types/Movie";
import { Show } from "../types/Show";
import { stringify } from "@std/csv";

const header = [
    "imdb_id",
    "tvdb_id",
    "type",
    "title",
    "season",
    "episode",
    "is_special",
    "is_watched",
    "watched_at",
    "status",
    "is_watchlisted",
];

type CsvParams = {
    shows: Partial<Show>[];
    movies: Partial<Movie>[];
};
export function toCsv({
    shows,
    movies,
}: CsvParams) {
    const movieCsvEntries = movies
        .map(({
            id,
            title,
            is_watched,
            watched_at,
        }) => [
            id?.imdb,
            id?.tvdb,
            "movie",
            title,
            "",
            "",
            false,
            is_watched,
            watched_at,
            "",
            watched_at == null,
        ]);

    const showCsvEntries = shows
        .flatMap(({
            title,
            seasons,
            status,
        }) =>
            (seasons ?? []).flatMap(({
                number: season,
                episodes,
            }) =>
                episodes
                    .map(({
                        id,
                        special,
                        number: episode,
                        is_watched,
                        watched_at,
                    }) => [
                        id?.imdb,
                        id?.tvdb,
                        "show",
                        title,
                        season,
                        episode,
                        special,
                        is_watched,
                        watched_at,
                        status,
                        watched_at == null,
                    ])
            )
        );

    return stringify([
        header,
        ...movieCsvEntries,
        ...showCsvEntries,
    ]);
}

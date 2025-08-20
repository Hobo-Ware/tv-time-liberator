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
    "rewatch_count",
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
            rewatch_count,
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
            rewatch_count,
            "",
            watched_at == null,
        ]);

    const episodesCsvEntries = shows
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
                    .filter(episode => episode.is_watched)
                    .map(({
                        id,
                        special,
                        number: episode,
                        is_watched,
                        watched_at,
                    }) => [
                        id?.imdb,
                        id?.tvdb,
                        "episode",
                        title,
                        season,
                        episode,
                        special,
                        is_watched,
                        watched_at,
                        "",
                        status,
                        watched_at == null,
                    ])
            )
        );

    const showCsvEntries = shows
        .flatMap(({
            id: showId,
            title,
            seasons,
            status,
        }) => {
            const hasUnwatchedEpisode = seasons?.some(
                ({ episodes }) => episodes.some(episode => !episode.is_watched)
            );

            return [[
                showId?.imdb,
                showId?.tvdb,
                "show",
                title,
                "",
                "",
                "",
                "",
                "",
                "",
                status,
                hasUnwatchedEpisode,
            ]]
        });

    return stringify([
        header,
        ...movieCsvEntries,
        ...episodesCsvEntries,
        ...showCsvEntries,
    ]);
}

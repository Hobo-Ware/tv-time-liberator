import { Movie } from '../types/Movie';
import { Show } from '../types/Show';
import { stringify } from 'csv-stringify/sync';

const header = [
    'id_imdb',
    'id_tvdb',
    'type',
    'title',
    'season',
    'episode',
    'is_special',
    'is_watched',
    'watched_at',
    "status",
];

type CsvParams = {
    shows: Partial<Show>[];
    movies: Partial<Movie>[];
}
export function toCsv({
    shows,
    movies,
}: CsvParams) {
    const movieCsvEntries = movies
        .map(({
            id,
            title,
            is_watched,
            watched_at
        }) => [
                id?.imdb,
                id?.tvdb,
                'movie',
                title,
                '',
                '',
                false,
                is_watched,
                watched_at,
                '',
            ]);

    const showCsvEntries = shows
        .flatMap(({
            title,
            seasons,
            status,
        }) =>
            seasons
                ?.flatMap(({
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
                                'show',
                                title,
                                season,
                                episode,
                                special,
                                is_watched,
                                watched_at,
                                status,
                            ])
                ));

    return stringify([
        header,
        ...movieCsvEntries,
        ...showCsvEntries,
    ], {
        quoted_empty: true,
        quoted_string: true,
        cast: {
            boolean: (value) => value ? '1' : '0',
        }
    });
} 
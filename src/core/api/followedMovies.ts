import { request, Resource } from '../http';
import type { MoviesResponse } from './models/MoviesResponse';
import type { Movie } from '../types/Movie';
import { assertDefined } from '../utils/assertDefined';
import { toIMDB } from './toIMDB';

type FollowedMoviesOptions = {
    userId: string;
    imdbResolver?: typeof toIMDB;
    onProgress?: ({ progress, title, total }: {
        progress: number,
        total: number,
        title: string
    }) => void;
}

/**
 * Retrieves a list of followed movies.
 * @returns {Array} An array of movie objects.
 */
export async function followedMovies({
    userId,
    imdbResolver = toIMDB,
    onProgress = () => { },
}: FollowedMoviesOptions): Promise<Movie[]> {
    const url = Resource.Get.Follows.Movies(userId);
    const movies = await request<MoviesResponse>(url)
        .then(response => response.data.objects);

    const progress = (() => {
        let progress = 0;
        const total = movies.length;

        return {
            done: () => {
                progress = 1;
                onProgress({
                    progress: 1,
                    total,
                    title: 'Movies exported.',
                });
            },
            increment: (by: number) => progress += by,
            report: (title: string) => onProgress({
                progress: progress / total,
                total,
                title,
            }),
        }
    })();

    const liberatedMovies: Movie[] = [];

    for (const movie of movies) {
        const title = movie.meta.name;
        progress.report(title);

        const tvdb = assertDefined(
            movie
                .meta
                .external_sources
                .find(source => source.source === 'tvdb'),
            'TVDB identifier not found.',
        )?.id;

        const imdb = await imdbResolver({ id: parseInt(tvdb), type: 'movie' });

        progress.increment(1);
        progress.report(title);

        liberatedMovies.push({
            id: {
                tvdb: parseInt(tvdb),
                imdb,
            },
            created_at: movie.created_at,
            uuid: movie.uuid,
            title,
            watched_at: movie.watched_at,
            is_watched: movie.watched_at != null,
        });
    }

    progress.done();

    return liberatedMovies;
}
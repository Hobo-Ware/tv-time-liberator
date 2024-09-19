import { request, Resource } from '../http';
import type { MoviesResponse } from './models/MoviesResponse';
import type { Movie } from '../types/Movie';
import { assertDefined } from '../utils/assertDefined';
import { toIMDB } from './toIMDB';

/**
 * Retrieves a list of followed movies.
 * @returns {Array} An array of movie objects.
 */
export async function followedMovies(userId: string, imdbResolver: typeof toIMDB = toIMDB): Promise<Movie[]> {
    const url = Resource.Get.Follows.Movies(userId);
    const movies = await request<MoviesResponse>(url)
        .then(response => response.data.objects);

    const mapped = movies
        .map(async object => {
            const tvdb = assertDefined(
                object
                    .meta
                    .external_sources
                    .find(source => source.source === 'tvdb'),
                'TVDB identifier not found.',
            )?.id;

            return {
                id: {
                    tvdb: parseInt(tvdb),
                    imdb: await imdbResolver({ id: parseInt(tvdb), type: 'movie' }),
                },
                created_at: object.created_at,
                uuid: object.uuid,
                title: object.meta.name,
                watched_at: object.watched_at,
                is_watched: object.watched_at != null,
            };
        })

    return Promise.all(mapped);
}
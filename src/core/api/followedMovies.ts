import { Resource } from '../http/Resource';
import { get } from '../http/get';
import { MovieResponse } from '../api/models/MovieResponse';
import { Movie } from '../types/Movie';
import { assertDefined } from '../utils/assertDefined';
import { IMDBUndefined } from '../types/IMDBReference';

/**
 * Retrieves a list of followed movies.
 * @returns {Array} An array of movie objects.
 */
export async function followedMovies(userId: string): Promise<Movie[]> {
    const url = Resource.Get.Follows.Movies(userId);
    const movies = await get<MovieResponse>(url)
        .then(response => response.data.objects);

    return movies.map(object => {
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
                imdb: '-1' as IMDBUndefined,
            },
            created_at: object.created_at,
            uuid: object.uuid,
            title: object.meta.name,
            watched_at: object.watched_at,
            is_watched: object.watched_at != null,
        };
    })
}
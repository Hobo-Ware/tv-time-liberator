import { Resource } from '../http/Resource';
import { get } from '../http/get';
import { MovieResponse } from '../api/models/MovieResponse';
import { Movie } from '../types/Movie';
import { assertDefined } from '../utils/assertDefined';

/**
 * Retrieves a list of followed movies.
 * @returns {Array} An array of movie objects.
 */
export async function followedMovies(userId: string): Promise<Movie[]> {
    const url = Resource.Get.Follows.Movies(userId);

    return get<MovieResponse>(url)
        .then(response => response.data.objects)
        .then(objects => objects.map(object => ({
            id: assertDefined(
                object
                    .meta
                    .external_sources
                    .find(source => source.source === 'tvdb'),
                'TVDB identifier not found.',
            )?.id,
            title: object.meta.name,
            watchedOn: object.watched_at,
            isWatched: object.watched_at != null,
        })));
}
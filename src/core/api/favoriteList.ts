import { request, Resource } from '../http';
import type { FavoriteResponse } from './models/FavoriteResponse';
import { followedMovies } from './followedMovies';
import { followedSeries } from './followedSeries';
import { toIMDB } from './toIMDB';
import { getMovie } from './getMovie';
import type { List } from '../types/List';
import { getSeries } from './getSeries';

/**
 * Retrieves a list of favorites.
 * @returns {Array} An array of movie objects.
 */
export async function favoriteList(userId: string, imdbResolver: typeof toIMDB = toIMDB): Promise<List> {
    const movieUrl = Resource.Get.Favorites.Movies(userId);
    const movies = await request<FavoriteResponse>(movieUrl)
        .then(response => response.data.objects);
    const favoritedMovies = movies ?? [];

    const seriesUrl = Resource.Get.Favorites.Series(userId);
    const series = await request<FavoriteResponse>(seriesUrl)
        .then(response => response.data.objects);
    const favoritedSeries = series ?? [];

    const myMovies = await followedMovies(userId, imdbResolver);
    const mySeries = await followedSeries(userId, imdbResolver);

    return {
        name: 'Favorites',
        description: 'Your favorite movies and series.',
        is_public: true,
        movies: await Promise.all(
            favoritedMovies.map(async movie => {
                const info = myMovies.find(m => m.uuid === movie.uuid) ?? await getMovie(movie.uuid, imdbResolver);
                return {
                    ...info,
                    added_at: movie.created_at,
                }
            })
        ),
        series: await Promise.all(
            favoritedSeries.map(async show => {
                const info = mySeries.find(s => s.uuid === show.uuid) ?? await getSeries(show.uuid, imdbResolver);

                return {
                    ...info,
                    added_at: show.created_at
                }
            })
        )
    }
}   
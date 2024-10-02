import { request, Resource } from '../http';
import type { FavoriteResponse } from './models/FavoriteResponse';
import { toIMDB } from './toIMDB';
import { getMovie } from './getMovie';
import type { List } from '../types/List';
import { getShow } from './getShow';
import { ProgressCallback, ProgressReporter } from '../utils/ProgressReporter';

type FavoriteListOptions = {
    userId: string;
    imdbResolver?: typeof toIMDB;
    onProgress?: ProgressCallback;
}

/**
 * Retrieves a list of favorites.
 * @returns {Array} An array of movie objects.
 */
export async function favoriteList({
    userId,
    imdbResolver = toIMDB,
    onProgress = () => { },
}: FavoriteListOptions): Promise<List> {
    const movieUrl = Resource.Get.Favorites.Movies(userId);
    const movies = await request<FavoriteResponse>(movieUrl)
        .then(response => response.data.objects);
    const favoriteMovie = movies ?? [];

    const showUrl = Resource.Get.Favorites.Shows(userId);
    const show = await request<FavoriteResponse>(showUrl)
        .then(response => response.data.objects);
    const favoriteShow = show ?? [];

    const progress = new ProgressReporter(
        favoriteMovie.length + favoriteShow.length,
        onProgress,
    );

    const liberatedMovies: List['movies'] = [];
    for (const movie of favoriteMovie) {
        progress.report(movie.name);

        const info = await getMovie({
            id: movie.uuid,
            imdbResolver,
        });
        liberatedMovies.push({
            ...info,
            added_at: movie.created_at,
        });
        progress.increment(1);
    }

    const liberatedShows: List['shows'] = [];
    for (const show of favoriteShow) {
        progress.report(show.name);
        const info = await getShow({
            id: show.uuid,
            imdbResolver,
            onProgress: ({ value: { current, previous }, message }) => {
                progress.increment(current - previous);
                progress.report(`${show.name} - ${message}`);
            },
        });

        liberatedShows.push({
            ...info,
            added_at: show.created_at,
        });
    }

    progress.done('Favorites exported.');
    return {
        name: 'Favorites',
        description: 'Your favorite movies and shows.',
        is_public: true,
        movies: liberatedMovies,
        shows: liberatedShows,
    }
}   
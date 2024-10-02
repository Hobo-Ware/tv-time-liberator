import { request, Resource } from '../http';
import type { FavoriteResponse } from './models/FavoriteResponse';
import { toIMDB } from './toIMDB';
import { getMovie } from './getMovie';
import type { List } from '../types/List';
import { getShow } from './getShow';

type FavoriteListOptions = {
    userId: string;
    imdbResolver?: typeof toIMDB;
    onProgress?: (progress: { progress: number; total: number; title: string }) => void;
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

    const progress = (() => {
        const total = favoriteMovie.length + favoriteShow.length;
        let progress = 0;

        return {
            done: () => {
                progress = 1;
                onProgress({
                    progress: 1,
                    total,
                    title: 'Favorites exported.',
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
        let previous = 0;
        const info = await getShow({
            id: show.uuid,
            imdbResolver,
            onProgress: ({ progress: value, title }) => {
                progress.increment(value - previous);
                previous = value;
                progress.report(`${show.name} - ${title}`);
            },
        });

        liberatedShows.push({
            ...info,
            added_at: show.created_at,
        });
    }

    progress.done();
    return {
        name: 'Favorites',
        description: 'Your favorite movies and shows.',
        is_public: true,
        movies: liberatedMovies,
        shows: liberatedShows,
    }
}   
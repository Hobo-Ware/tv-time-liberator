import { request, Resource } from '../http';
import type { FavoriteResponse } from './models/FavoriteResponse';
import { toIMDB } from './toIMDB';
import { getMovie } from './getMovie';
import type { List } from '../types/List';
import { getSeries } from './getSeries';

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
    const favoritedMovies = movies ?? [];

    const seriesUrl = Resource.Get.Favorites.Series(userId);
    const series = await request<FavoriteResponse>(seriesUrl)
        .then(response => response.data.objects);
    const favoritedSeries = series ?? [];

    const progress = (() => {
        const total = favoritedMovies.length + favoritedSeries.length;
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
    for (const movie of favoritedMovies) {
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

    const liberatedSeries: List['series'] = [];
    for (const show of favoritedSeries) {
        progress.report(show.name);
        let previous = 0;
        const info = await getSeries({
            id: show.uuid,
            imdbResolver,
            onProgress: ({ progress: value, title }) => {
                progress.increment(value - previous);
                previous = value;
                progress.report(`${show.name} - ${title}`);
            },
        });

        liberatedSeries.push({
            ...info,
            added_at: show.created_at,
        });
    }

    progress.done();
    return {
        name: 'Favorites',
        description: 'Your favorite movies and series.',
        is_public: true,
        movies: liberatedMovies,
        series: liberatedSeries,
    }
}   
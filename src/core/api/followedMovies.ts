import { paginatedRequest, Resource } from '../http';
import type { Movie } from '../types/Movie';
import { assertDefined } from '../utils/assertDefined';
import { ProgressCallback, ProgressReporter } from '../utils/ProgressReporter';
import type { MovieEntry } from './models/MovieEntry';
import { getMovieRating } from './ratings';
import { toIMDB } from './toIMDB';

type FollowedMoviesOptions = {
    userId: string;
    imdbResolver?: typeof toIMDB;
    onProgress?: ProgressCallback;
}

/**
 * Retrieves a list of followed movies.
 * @returns {Array} An array of movie objects.
 */
const MOVIE_INCREMENT = .5;
const RATING_INCREMENT = .5;

export async function followedMovies({
    userId,
    imdbResolver = toIMDB,
    onProgress = () => { },
}: FollowedMoviesOptions): Promise<Movie[]> {
    const movies = await paginatedRequest<MovieEntry>(
        (page) => Resource.Get.Follows.Movies(userId, page),
        (page, total) => onProgress({
            value: { current: 0, previous: 0 },
            estimated: Infinity,
            total: Infinity,
            message: 'Fetching your movies...',
            subMessage: `${total.toLocaleString()} loaded · page ${page}`,
        }),
    );

    const progress = new ProgressReporter(
        movies.length,
        onProgress,
    );

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

        progress.increment(MOVIE_INCREMENT);
        progress.report(title);

        const rating = await getMovieRating(movie.uuid, userId);
        progress.increment(RATING_INCREMENT);

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
            rating,
        });
    }

    progress.done('Movies exported.');
    
    return liberatedMovies;
}
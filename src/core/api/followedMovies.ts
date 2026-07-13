import { paginatedRequest, Resource } from '../http';
import type { Movie } from '../types/Movie';
import { assertDefined } from '../utils/assertDefined';
import { mapPool } from '../utils/mapPool';
import { ProgressCallback, ProgressReporter } from '../utils/ProgressReporter';
import { getMovie } from './getMovie';
import type { MovieEntry } from './models/MovieEntry';
import { fetchAllMovieWatches } from './movieWatches';
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
const MOVIE_DETAIL_CONCURRENCY = 8;

export async function followedMovies({
    userId,
    imdbResolver = toIMDB,
    onProgress = () => { },
}: FollowedMoviesOptions): Promise<Movie[]> {
    const [movies, watchedMap] = await Promise.all([
        paginatedRequest<MovieEntry>(
            (page) => Resource.Get.Follows.Movies(userId, page),
            (page, total) => onProgress({
                value: { current: 0, previous: 0 },
                estimated: Infinity,
                total: Infinity,
                message: 'Fetching your movies...',
                subMessage: `${total.toLocaleString()} loaded · page ${page}`,
            }),
            (movie) => movie.uuid,
        ),
        fetchAllMovieWatches(userId, onProgress),
    ]);

    const followedUuids = new Set(movies.map(movie => String(movie.uuid)));
    // Watched but not followed: the follows list misses these entirely.
    const watchOnlyUuids = [...watchedMap.keys()].filter(uuid => !followedUuids.has(uuid));

    const progress = new ProgressReporter(
        movies.length + watchOnlyUuids.length,
        onProgress,
    );

    const liberatedMovies: Movie[] = [];

    for (const movie of movies) {
        const title = movie.meta?.name ?? "Unknown";
        progress.report(title);
        progress.increment(MOVIE_INCREMENT);

        try {
            const tvdb = assertDefined(
                movie
                    .meta
                    .external_sources
                    .find(source => source.source === 'tvdb'),
                'TVDB identifier not found.',
            )?.id;

            const imdb = await imdbResolver({ id: parseInt(tvdb), type: 'movie' });

            progress.report(title);

            const rating = await getMovieRating(movie.uuid, userId);
            progress.increment(RATING_INCREMENT);

            const watch = watchedMap.get(String(movie.uuid));

            liberatedMovies.push({
                id: {
                    tvdb: parseInt(tvdb),
                    imdb,
                },
                created_at: movie.created_at,
                uuid: movie.uuid,
                title,
                watched_at: movie.watched_at,
                is_watched: movie.watched_at != null || watch != null,
                rewatch_count: watch?.rewatch_count ?? 0,
                rating,
            });
        } catch (error) {
            // Skip a movie whose metadata is missing/broken rather than
            // aborting the whole export.
            console.warn(`[Liberator] skipping movie "${title}"`, error);
            progress.increment(RATING_INCREMENT);
        }
    }

    // Fetch detail for watch-only movies (bounded concurrency); the follows
    // endpoint carried no metadata for them.
    const watchOnly = await mapPool(watchOnlyUuids, MOVIE_DETAIL_CONCURRENCY, async (uuid) => {
        try {
            const info = await getMovie({ id: uuid, userId, imdbResolver });
            const watch = watchedMap.get(uuid);
            progress.increment(1);
            progress.report(info.title);
            return {
                ...info,
                is_watched: true,
                watched_at: watch?.watched_at ?? undefined,
                rewatch_count: watch?.rewatch_count ?? 0,
            } satisfies Movie;
        } catch {
            progress.increment(1);
            return null;
        }
    });

    progress.done('Movies exported.');

    return [...liberatedMovies, ...watchOnly.filter((movie): movie is Movie => movie != null)];
}

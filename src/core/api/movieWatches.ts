import { paginatedRequest, Resource } from '../http';
import { normalizeWatchedAt } from '../utils/normalizeWatchedAt';
import type { ProgressCallback } from '../utils/ProgressReporter';

type MovieWatchEntry = {
    uuid: string;
    watched_at: string | null;
    rewatch_count?: number;
};

export type MovieWatch = {
    watched_at: string | null;
    rewatch_count: number;
};

/**
 * Fetches the full movie watch history in one bulk paginated call, returning a
 * Map from movie uuid to watch state. This is the authoritative source for
 * watched_at / rewatch_count, and surfaces watch-only movies (watched but not
 * followed) that the follows endpoint omits entirely.
 */
export async function fetchAllMovieWatches(
    userId: string,
    onProgress?: ProgressCallback,
): Promise<Map<string, MovieWatch>> {
    const entries = await paginatedRequest<MovieWatchEntry>(
        (page) => Resource.Get.MovieWatches(userId, page),
        (page, total) => onProgress?.({
            value: { current: 0, previous: 0 },
            estimated: Infinity,
            total: Infinity,
            message: 'Fetching movie history...',
            subMessage: `${total.toLocaleString()} watched · page ${page}`,
        }),
        (entry) => entry.uuid,
    );

    const map = new Map<string, MovieWatch>();
    for (const entry of entries) {
        if (!entry?.uuid) continue;
        map.set(String(entry.uuid), {
            watched_at: normalizeWatchedAt(entry.watched_at),
            rewatch_count: entry.rewatch_count ?? 0,
        });
    }

    return map;
}

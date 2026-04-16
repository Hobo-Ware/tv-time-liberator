import { paginatedRequest, Resource } from '../http';
import type { ProgressCallback } from '../utils/ProgressReporter';

type EpisodeWatchEntry = {
    episode_id: number;
    watched_at: string | null;
};

/**
 * Fetches the full episode watch history for a user in one bulk paginated call,
 * returning a Map from episode TVDB ID to watched_at timestamp.
 *
 * This replaces the per-episode `GET /episode/{id}` calls in getShowSeasons,
 * reducing N serial HTTP calls to a single paginated fetch sequence.
 */
export async function fetchAllEpisodeWatches(
    userId: string,
    onProgress?: ProgressCallback,
): Promise<Map<number, string | null>> {
    const entries = await paginatedRequest<EpisodeWatchEntry>(
        (page) => Resource.Get.EpisodeWatches(userId, page),
        (page, total) => onProgress?.({
            value: { current: 0, previous: 0 },
            estimated: Infinity,
            total: Infinity,
            message: `Fetching watch history...`,
            subMessage: `${total.toLocaleString()} episodes · page ${page}`,
        }),
        (entry) => entry.episode_id,
    );

    return new Map(entries.map(e => [e.episode_id, e.watched_at ?? null]));
}

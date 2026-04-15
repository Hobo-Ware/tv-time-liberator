import { paginatedRequest, Resource } from '../http';

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
export async function fetchAllEpisodeWatches(userId: string): Promise<Map<number, string | null>> {
    const entries = await paginatedRequest<EpisodeWatchEntry>(
        (page) => Resource.Get.EpisodeWatches(userId, page),
    );

    return new Map(entries.map(e => [e.episode_id, e.watched_at ?? null]));
}

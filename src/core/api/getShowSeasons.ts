import { request, Resource } from '../http';
import type { Season } from '../types/Season';
import { normalizeWatchedAt } from '../utils/normalizeWatchedAt';
import { ProgressCallback, ProgressReporter } from '../utils/ProgressReporter';
import { fetchAllEpisodeWatches } from './episodeWatches';
import type { ShowInfoResponse } from './models/ShowInfoResponse';
import { getEpisodeRating } from './ratings';
import { toIMDB } from './toIMDB';

type SeriesInfoOptions = {
    id: number;
    userId?: string;
    imdbResolver?: typeof toIMDB;
    onProgress?: ProgressCallback;
    /**
     * Pre-fetched map of episode TVDB ID → watched_at timestamp.
     * When provided, the per-episode API call is skipped entirely,
     * reducing N serial HTTP calls to a single map lookup.
     */
    watchedAtMap?: Map<number, string | null>;
};

export async function getShowSeasons({
    id,
    userId,
    imdbResolver = toIMDB,
    onProgress = () => { },
    watchedAtMap,
}: SeriesInfoOptions): Promise<Season[]> {
    const url = Resource.Get.Shows.Info(id);

    const { seasons = [] } = await request<ShowInfoResponse>(url);

    const resolvedWatchedAtMap = watchedAtMap
        ?? (userId != null ? await fetchAllEpisodeWatches(userId) : undefined);

    const progress = new ProgressReporter(
        seasons.reduce((acc, season) => acc + season.episodes.length, 0),
        onProgress,
    );

    const extended: Season[] = [];
    for (const season of seasons) {
        const episodes: Season['episodes'] = [];

        for (let j = 0; j < season.episodes.length; j++) {
            const episode = season.episodes[j];

            const watched_at = resolvedWatchedAtMap
                ? (resolvedWatchedAtMap.get(episode.id) ?? null)
                : normalizeWatchedAt((await request<{ watched_date: string }>(Resource.Get.Episode.Info(episode.id))).watched_date);

            const rating = userId != null
                ? await getEpisodeRating(episode.id, userId)
                : null;

            const extendedEpisode = {
                id: {
                    tvdb: episode.id,
                    imdb: await imdbResolver({ showId: id, episodeId: episode.id, type: 'episode' }),
                },
                number: episode.number,
                special: episode.is_special,
                is_watched: episode.is_watched,
                watched_at,
                rating,
            };

            progress.increment(1);
            progress.report(`Season ${season.number} - Episode ${episode.number}`);
            episodes.push(extendedEpisode);
        }

        extended.push({
            number: season.number,
            episodes,
        });
    }

    progress.done('Show seasons exported.');
    return extended;
}
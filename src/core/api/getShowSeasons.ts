import { request, Resource } from '../http';
import type { Season } from '../types/Season';
import { ProgressCallback, ProgressReporter } from '../utils/ProgressReporter';
import type { ShowInfoResponse } from './models/ShowInfoResponse';
import { toIMDB } from './toIMDB';

type SeriesInfoOptions = {
    id: number;
    imdbResolver?: typeof toIMDB;
    onProgress?: ProgressCallback;
};

export async function getShowSeasons({
    id,
    imdbResolver = toIMDB,
    onProgress = () => { },
}: SeriesInfoOptions): Promise<Season[]> {
    const url = Resource.Get.Shows.Info(id);

    const { seasons } = await request<ShowInfoResponse>(url);

    const progress = new ProgressReporter(
        seasons.reduce((acc, season) => acc + season.episodes.length, 0),
        onProgress,
    );

    const extended: Season[] = [];
    for (const season of seasons) {
        const episodes: Season['episodes'] = [];

        for (let j = 0; j < season.episodes.length; j++) {
            const episode = season.episodes[j];
            const { watched_date: watched_at } = await request<{ watched_date: string }>(Resource.Get.Episode.Info(episode.id))

            const extendedEpisode = {
                id: {
                    tvdb: episode.id,
                    imdb: await imdbResolver({ showId: id, episodeId: episode.id, type: 'episode' }),
                },
                number: episode.number,
                special: episode.is_special,
                is_watched: episode.is_watched,
                watched_at,
            };

            progress.increment(1);
            progress.report(`Season ${season.number} - Episode ${episode.number}`);
            episodes.push(extendedEpisode);
        }

        const extendedSeason = {
            number: season.number,
            episodes: episodes,
        };

        extended.push(extendedSeason);
    }

    progress.done('Show seasons exported.');
    return extended;
}
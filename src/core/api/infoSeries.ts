import { request, Resource } from '../http';
import type { Season } from '../types/Season';
import type { SeriesInfoResponse } from './models/SeriesInfoResponse';
import { toIMDB } from './toIMDB';

type SeriesInfoOptions = {
    id: number;
    onProgress?: (progress: {
        progress: number;
        title: string,
        total: number
    }) => void;
    imdbResolver?: typeof toIMDB;
};

export async function infoSeries({
    id,
    imdbResolver = toIMDB,
    onProgress = () => { },
}: SeriesInfoOptions): Promise<Season[]> {
    const url = Resource.Get.Series.Info(id);

    const { seasons } = await request<SeriesInfoResponse>(url);

    const progress = (() => {
        let progress = 0;
        const total = seasons.reduce((acc, season) => acc + season.episodes.length, 0);

        return {
            increment: (by: number) => progress += by,
            report: (title: string) => onProgress({
                total,
                progress: progress / total,
                title,
            }),
        }
    })();

    const extended: Season[] = [];
    for (let i = 0; i < seasons.length; i++) {
        const season = seasons[i];
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

    return extended;
}
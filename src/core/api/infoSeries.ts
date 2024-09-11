import { get } from '../http/get';
import { Resource } from '../http/Resource';
import { Season } from '../types/Season';
import { delay } from './delay';
import { SeriesInfoResponse } from './models/SeriesInfoResponse';

export async function infoSeries(id: number): Promise<Season[]> {
    const url = Resource.Get.Series.Info(id);

    const { seasons } = await get<SeriesInfoResponse>(url);

    const extended = seasons.map(async season => {
        const episodes = season
            .episodes
            .map(async episode => {
                const { watched_date: watched_at } = await delay()
                    .then(() => get<{ watched_date: string }>(Resource.Get.Episode.Info(episode.id)));

                return {
                    number: episode.number,
                    special: episode.is_special,
                    is_watched: episode.is_watched,
                    watched_at,
                }
            });

        return {
            number: season.number,
            episodes: await Promise.all(episodes),
        };
    });

    return Promise.all(extended);
}
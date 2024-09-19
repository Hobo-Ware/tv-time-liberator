import { request, Resource } from '../http';
import type { Season } from '../types/Season';
import { delay } from './delay';
import type { SeriesInfoResponse } from './models/SeriesInfoResponse';
import { toIMDB } from './toIMDB';

export async function infoSeries(id: number, imdbResolver: typeof toIMDB = toIMDB): Promise<Season[]> {
    const url = Resource.Get.Series.Info(id);

    const { seasons } = await request<SeriesInfoResponse>(url);

    const extended = seasons.map(async season => {
        const episodes = season
            .episodes
            .map(async episode => {
                const { watched_date: watched_at } = await delay()
                    .then(() => request<{ watched_date: string }>(Resource.Get.Episode.Info(episode.id)));

                return {
                    id: {
                        tvdb: episode.id,
                        imdb: await imdbResolver({ showId: id, episodeId: episode.id, type: 'episode' }),
                    },
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
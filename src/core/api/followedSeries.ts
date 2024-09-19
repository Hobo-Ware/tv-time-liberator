
import { request, Resource } from '../http';
import type { SeriesResponse } from './models/SeriesReposne';
import type { Series } from '../types/Series';
import { assertDefined } from '../utils/assertDefined';
import { infoSeries } from './infoSeries';
import { delay } from './delay';
import { toIMDB } from './toIMDB';

/**
 * Retrieves a list of followed series.
 * @returns {Array} An array of series objects.
 */
export async function followedSeries(userId: string, imdbResolver: typeof toIMDB = toIMDB): Promise<Series[]> {
    const url = Resource.Get.Follows.Series(userId);

    const series = await request<SeriesResponse>(url)
        .then(response => response.data.objects)
        .then(objects => {
            const mapped = objects
                .map(async object => ({
                    uuid: object.uuid,
                    id: {
                        tvdb: object.meta.id,
                        imdb: await imdbResolver({ id: object.meta.id, type: 'series' }),
                    },
                    created_at: object.created_at,
                    title: object.meta.name,
                    status: assertDefined(object.filter.at(-1), 'Status not found.') as Series['status'],
                }));

            return Promise.all(mapped);
        });


    const infoRequests = series
        .map(async show => {
            const info = await delay()
                .then(() => infoSeries(show.id.tvdb, imdbResolver));

            console.log(`Fetched info for ${show.title}.`);

            return {
                ...show,
                seasons: info,
            };
        });

    return Promise.all(infoRequests);
}
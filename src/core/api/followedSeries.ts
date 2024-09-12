
import { Resource } from '../http/Resource';
import { get } from '../http/get';
import { SeriesResponse } from './models/SeriesReposne';
import { Series } from '../types/Series';
import { assertDefined } from '../utils/assertDefined';
import { infoSeries } from './infoSeries';
import { delay } from './delay';
import { Undetermined } from '../types/MediaIdentifier';

/**
 * Retrieves a list of followed series.
 * @returns {Array} An array of series objects.
 */
export async function followedSeries(userId: string): Promise<Series[]> {
    const url = Resource.Get.Follows.Series(userId);

    const series = await get<SeriesResponse>(url)
        .then(response => response.data.objects)
        .then(objects => objects.map(object => ({
            uuid: object.uuid,
            id: {
                tvdb: object.meta.id,
                imdb: '-1' as Undetermined,
            },
            created_at: object.created_at,
            title: object.meta.name,
            status: assertDefined(object.filter.at(-1), 'Status not found.') as Series['status'],
        })));


    const infoRequests = series
        .map(async show => {
            const info = await delay()
                .then(() => infoSeries(show.id.tvdb));

            console.log(`Fetched info for ${show.title}.`);

            return {
                ...show,
                seasons: info,
            };
        });

    return Promise.all(infoRequests);
}
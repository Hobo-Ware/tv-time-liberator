
import { Resource } from '../http/Resource';
import { get } from '../http/get';
import { SeriesResponse } from './models/SeriesReposne';
import { Series } from '../types/Series';
import { assertDefined } from '../utils/assertDefined';

/**
 * Retrieves a list of followed series.
 * @returns {Array} An array of series objects.
 */
export async function followedSeries(userId: string): Promise<Series[]> {
    const url = Resource.Get.Follows.Series(userId);

    return get<SeriesResponse>(url)
        .then(response => response.data.objects)
        .then(objects => objects.map(object => ({
            uuid: object.uuid,
            id: object.meta.id,
            title: object.meta.name,
            status: assertDefined(object.filter.at(-1), 'Status not found.') as Series['status'],
        })));
}
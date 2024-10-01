import { request, Resource } from '../http';
import { Series } from '../types/Series';
import { infoSeries } from './infoSeries';
import { SeriesResponse } from './models/SeriesResponse';
import { toIMDB } from './toIMDB';

export async function getSeries(id: string, imdbResolver: typeof toIMDB = toIMDB): Promise<Omit<Series, 'created_at' | 'status'>> {
    const url = Resource.Get.Series.GetByUUID(id);

    const {
        id: tvdb,
        imdb_id: imdb,
        uuid,
        name: title,
    } = await request<SeriesResponse>(url)
        .then(response => response.data);

    const seasons = await infoSeries({ id: tvdb, imdbResolver });

    return {
        id: {
            imdb,
            tvdb,
        },
        title,
        uuid,
        seasons,
    };
}
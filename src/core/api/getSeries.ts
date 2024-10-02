import { request, Resource } from '../http';
import { Series } from '../types/Series';
import { infoSeries } from './infoSeries';
import { SeriesResponse } from './models/SeriesResponse';
import { toIMDB } from './toIMDB';

type GetSeriesOptions = {
    id: string;
    imdbResolver?: typeof toIMDB;
    onProgress?: (progress: {
        progress: number;
        title: string,
        total: number
    }) => void;
}

export async function getSeries({
    id,
    imdbResolver = toIMDB,
    onProgress = () => { },
}: GetSeriesOptions): Promise<Omit<Series, 'created_at' | 'status'>> {
    const url = Resource.Get.Series.GetByUUID(id);

    const {
        id: tvdb,
        imdb_id: imdb,
        uuid,
        name: title,
    } = await request<SeriesResponse>(url)
        .then(response => response.data);

    const seasons = await infoSeries({
        id: tvdb,
        imdbResolver,
        onProgress,
    });

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
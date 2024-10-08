import { request, Resource } from '../http';
import { Show } from '../types/Show';
import { ProgressCallback } from '../utils/ProgressReporter';
import { getShowSeasons } from './getShowSeasons';
import { ShowResponse } from './models/ShowResponse';
import { toIMDB } from './toIMDB';

type GetSeriesOptions = {
    id: string;
    imdbResolver?: typeof toIMDB;
    onProgress?: ProgressCallback;
}

export async function getShow({
    id,
    imdbResolver = toIMDB,
    onProgress = () => { },
}: GetSeriesOptions): Promise<Omit<Show, 'created_at' | 'status'>> {
    const url = Resource.Get.Shows.GetByUUID(id);

    const {
        id: tvdb,
        imdb_id: imdb,
        uuid,
        name: title,
    } = await request<ShowResponse>(url)
        .then(response => response.data);

    const seasons = await getShowSeasons({
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
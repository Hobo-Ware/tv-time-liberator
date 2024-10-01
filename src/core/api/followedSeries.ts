
import { request, Resource } from '../http';
import type { SeriesListResponse } from './models/SeriesListResponse';
import type { Series } from '../types/Series';
import { assertDefined } from '../utils/assertDefined';
import { infoSeries } from './infoSeries';
import { toIMDB } from './toIMDB';

const SHOW_INCREMENT = .25;
const SEASONS_INCREMENT = .75;

type FollowedSeriesOptions = {
    userId: string;
    imdbResolver?: typeof toIMDB;
    onProgress?: (progress: { progress: number; total: number; title: string }) => void;
};

/**
 * Retrieves a list of followed series.
 * @returns {Array} An array of series objects.
 */
export async function followedSeries({
    userId,
    imdbResolver = toIMDB,
    onProgress = () => { },
}: FollowedSeriesOptions): Promise<Series[]> {
    const url = Resource.Get.Follows.Series(userId);

    const seriesListResponse = await request<SeriesListResponse>(url);
    const objects = seriesListResponse.data.objects;

    const series: Series[] = [];

    const progress = (() => {
        let progress = 0;
        const total = objects.length;

        return {
            done: () => {
                progress = 1;
                onProgress({
                    progress: 1,
                    total,
                    title: 'Shows exported.',
                });
            },
            increment: (by: number) => progress += by,
            report: (title: string) => onProgress({
                progress: progress / total,
                total,
                title,
            }),
        }
    })();

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const title = object.meta.name;
        progress.report(title);

        const show: Series = {
            uuid: object.uuid,
            id: {
                tvdb: object.meta.id,
                imdb: await imdbResolver({ id: object.meta.id, type: 'series' }),
            },
            seasons: [],
            created_at: object.created_at,
            title,
            status: assertDefined(object.filter.at(-1), 'Status not found.') as Series['status'],
        };

        progress.increment(SHOW_INCREMENT);
        progress.report(title);

        series.push(show);
    }

    const finalSeries: Series[] = [];
    for (const show of series) {
        progress.report(show.title);

        const info = await infoSeries({
            id: show.id.tvdb,
            onProgress: ({ title, total }) => {
                progress.increment(SEASONS_INCREMENT / total);
                progress.report(`${show.title} - ${title}`);
            },
            imdbResolver
        });

        finalSeries.push({
            ...show,
            seasons: info,
        });
    }

    progress.done();

    return finalSeries;
}
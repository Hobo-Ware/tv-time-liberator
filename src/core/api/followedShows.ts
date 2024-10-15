
import { request, Resource } from '../http';
import type { ShowsListResponse } from './models/ShowsListResponse';
import type { Show } from '../types/Show';
import { assertDefined } from '../utils/assertDefined';
import { getShowSeasons } from './getShowSeasons';
import { toIMDB } from './toIMDB';
import { ProgressCallback, ProgressReporter } from '../utils/ProgressReporter';

const SHOW_INCREMENT = .25;
const SEASONS_INCREMENT = .75;

type FollowedShowsOptions = {
    userId: string;
    imdbResolver?: typeof toIMDB;
    onProgress?: ProgressCallback;
};

/**
 * Retrieves a list of followed shows.
 * @returns {Array} An array of shows objects.
 */
export async function followedShows({
    userId,
    imdbResolver = toIMDB,
    onProgress = () => { },
}: FollowedShowsOptions): Promise<Show[]> {
    const url = Resource.Get.Follows.Shows(userId);

    const showsResponse = await request<ShowsListResponse>(url);
    const objects = showsResponse.data.objects;

    const shows: Show[] = [];

    const progress = new ProgressReporter(
        objects.length,
        onProgress,
    );

    for (const object of objects) {
        const title = object.meta.name;
        progress.report(title);

        const show: Show = {
            uuid: object.uuid,
            id: {
                tvdb: object.meta.id,
                imdb: await imdbResolver({
                    id: object.meta.id,
                    type: 'show'
                }),
            },
            seasons: [],
            created_at: object.created_at,
            title,
            status: assertDefined(object.filter.at(-1), 'Status not found.') as Show['status'],
        };

        progress.increment(SHOW_INCREMENT);
        progress.report(title);

        shows.push(show);
    }

    const liberatedShows: Show[] = [];
    for (const show of shows) {
        progress.report(show.title);

        const info = await getShowSeasons({
            id: show.id.tvdb,
            onProgress: ({ message, value: { previous, current, } }) => {
                progress.increment(SEASONS_INCREMENT * (current - previous));
                progress.report(`${show.title} - ${message}`);
            },
            imdbResolver,
        });

        liberatedShows.push({
            ...show,
            seasons: info,
        });
    }

    progress.done('Shows exported.');

    return liberatedShows;
}
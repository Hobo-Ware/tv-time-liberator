import { Resource } from '../http/Resource';
import type { ListsResponse } from './models/ListsResponse';
import type { List } from '../types/List';
import { request } from '../http';
import { getShow } from './getShow';
import { getMovie } from './getMovie';
import { toIMDB } from './toIMDB';
import { MediaType } from '../types/MediaType';

type MyListsOptions = {
    userId: string;
    imdbResolver?: typeof toIMDB;
    onProgress?: (progress: { progress: number; total: number; title: string }) => void;
}

export async function myLists({
    userId,
    imdbResolver = toIMDB,
    onProgress = () => { },
}: MyListsOptions): Promise<List[]> {
    const url = Resource.Get.Lists(userId);

    const result = await request<ListsResponse>(url)
        .then(response => response.data)
        .then(lists => lists
            .map(list => ({
                name: list.name,
                description: list.description,
                is_public: list.is_public,
                items: list
                    .objects
                    .map(item => ({
                        uuid: item.uuid,
                        title: item.name,
                        created_at: item.created_at,
                        type: item.type,
                    }))
            })));


    const progress = (() => {
        const total = result.reduce((acc, list) => acc + list.items.length, 0);
        let progress = 0;

        return {
            done: () => {
                progress = 1;
                onProgress({
                    progress: 1,
                    total: 1,
                    title: 'Lists exported.',
                });
            },
            increment: (by: number) => progress += by,
            report: (title: string) => onProgress({
                progress: progress / total,
                total: 1,
                title,
            }),
        }
    })();

    const lists: List[] = [];

    for (const list of result) {
        const shows: List['shows'] = [];
        const movies: List['movies'] = [];
        for (const item of list.items) {
            progress.report(item.title);

            if (item.type === MediaType.Show) {
                let previous = 0;
                const info = await getShow({
                    id: item.uuid,
                    imdbResolver,
                    onProgress: ({ progress: value, title }) => {
                        progress.increment(value - previous);
                        previous = value;
                        progress.report(title);
                    },
                });

                shows.push({
                    ...info,
                    added_at: item.created_at
                });
            }

            if (item.type === MediaType.Movie) {
                const info = await getMovie({
                    id: item.uuid,
                    imdbResolver,
                });

                movies.push({
                    ...info,
                    added_at: item.created_at
                });
                progress.increment(1);
                progress.report(item.title);
            }

            progress.report(item.title);
        }

        lists.push({
            name: list.name,
            description: list.description,
            is_public: list.is_public,
            shows,
            movies,
        });
    }

    progress.done();

    return lists;
}
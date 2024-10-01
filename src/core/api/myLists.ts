import { Resource } from '../http/Resource';
import type { ListsResponse } from './models/ListsResponse';
import type { List } from '../types/List';
import { request } from '../http';
import { followedSeries } from './followedSeries';
import { getSeries } from './getSeries';
import { followedMovies } from './followedMovies';
import { getMovie } from './getMovie';
import { toIMDB } from './toIMDB';

export async function myLists(userId: string, imdbResolver: typeof toIMDB = toIMDB): Promise<List[]> {
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
                        type: item.type
                    }))
            })));

    const lists: List[] = [];

    for (const list of result) {
        const series: List['series'] = [];
        const movies: List['movies'] = [];
        for (const item of list.items) {
            if (item.type === 'series') {
                const info = await followedSeries(userId, imdbResolver)
                    .then(r => r.find(show => show.uuid === item.uuid))
                    ?? await getSeries(item.uuid, imdbResolver);

                series.push({
                    ...info,
                    added_at: item.created_at
                });
            }

            if (item.type === 'movie') {
                const info = await followedMovies({ userId, imdbResolver })
                    .then(r => r.find(movie => movie.uuid === item.uuid))
                    ?? await getMovie(item.uuid, imdbResolver);

                movies.push({
                    ...info,
                    added_at: item.created_at
                });
            }
        }

        lists.push({
            name: list.name,
            description: list.description,
            is_public: list.is_public,
            series,
            movies,
        });
    }

    return lists;
}
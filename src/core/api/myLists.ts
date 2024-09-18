import axios from 'axios';
import { Resource } from '../http/Resource';
import { ListsResponse } from './models/ListsResponse';
import { List } from '../types/List';

export function myLists(userId: string): Promise<List[]> {
    const url = Resource.Get.Lists(userId);

    return axios.get<ListsResponse>(url)
        .then(response => response.data.data)
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
}
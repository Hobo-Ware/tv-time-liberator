import { Favorite } from './Favorite';

export type ListItem = {
    uuid: string;
    title: string;
    created_at: string;
    type: 'movie' | 'series';
}

export type List = {
    name: string;
    description: string;
    is_public: boolean;
    items: ListItem[];
}
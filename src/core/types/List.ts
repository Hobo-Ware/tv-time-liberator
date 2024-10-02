import type { Movie } from './Movie';
import type { Show } from './Show';

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
    shows: Array<Omit<Show, 'created_at' | 'status'> & { added_at: string }>;
    movies: Array<Omit<Movie, 'created_at' | 'is_watched'> & { added_at: string }>;
}
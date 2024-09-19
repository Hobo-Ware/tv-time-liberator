import { Favorite } from './Favorite';
import { Movie } from './Movie';
import { Series } from './Series';

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
    series: Array<Omit<Series, 'created_at' | 'status'> & { added_at: string }>;
    movies: Array<Omit<Movie, 'created_at'> & { added_at: string }>;
}
import type { MovieEntry } from './MovieEntry';

export type MovieResponse = {
    data: {
        objects: MovieEntry[];
    }
};
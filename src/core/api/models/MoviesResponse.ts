import type { MovieEntry } from './MovieEntry';

export type MoviesResponse = {
    data: {
        objects: MovieEntry[];
    }
};
export type Undetermined = '-1';

export type MediaIdentifier = {
    tvdb: number;
    imdb: `tt${string}` | Undetermined;
};
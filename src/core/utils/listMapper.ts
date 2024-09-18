import { Favorite } from '../types/Favorite'
import { ListItem } from '../types/List';
import { Movie } from '../types/Movie';
import { Series } from '../types/Series';
import { assertDefined } from './assertDefined';

type ListMapper = {
    list: ListItem[];
    movies: Movie[];
    series: Series[];
}

export type MovieItem = Movie & {
    added_at: string;
}

export type ShowItem = Series & {
    added_at: string;
}

export function listMapper({
    list,
    movies,
    series,
}: ListMapper) {
    return {
        movies: movies
            .filter(movie => list.some(fav => fav.uuid === movie.uuid))
            .map(movie => {
                const favorite = list.find(fav => fav.uuid === movie.uuid);
                const { created_at: added_at } = assertDefined(favorite, `Could not find favorite entry for ${movie.title}.`);

                return {
                    ...movie,
                    added_at,
                };
            }),
        series: series
            .filter(show => list.some(fav => fav.uuid === show.uuid))
            .map(show => {
                const favorite = list.find(fav => fav.uuid === show.uuid);
                const { created_at: added_at } = assertDefined(favorite, `Could not find favorite entry for ${show.title}.`);

                return {
                    ...show,
                    added_at,
                };
            }),
    };
}
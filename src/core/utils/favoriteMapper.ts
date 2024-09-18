import { Favorite } from '../types/Favorite'
import { Movie } from '../types/Movie';
import { Series } from '../types/Series';
import { assertDefined } from './assertDefined';

type FavoriteMapper = {
    favorites: Favorite[];
    movies: Movie[];
    series: Series[];
}

export type FavoriteMovie = Movie & {
    favorited_at: string;
}

export type FavoriteSerie = Series & {
    favorited_at: string;
}

export function favoriteMapper({
    favorites,
    movies,
    series,
}: FavoriteMapper) {
    return {
        movies: movies
            .filter(movie => favorites.some(fav => fav.uuid === movie.uuid))
            .map(movie => {
                const favorite = favorites.find(fav => fav.uuid === movie.uuid);
                const { created_at: favorited_at } = assertDefined(favorite, `Could not find favorite entry for ${movie.title}.`);
                
                return {
                    ...movie,
                    favorited_at,
                };
            }),
        series: series
            .filter(show => favorites.some(fav => fav.uuid === show.uuid))
            .map(show => {
                const favorite = favorites.find(fav => fav.uuid === show.uuid);
                const { created_at: favorited_at } = assertDefined(favorite, `Could not find favorite entry for ${show.title}.`);

                return {
                    ...show,
                    favorited_at,
                };
            }),
    };
}
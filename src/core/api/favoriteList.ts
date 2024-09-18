import { Resource } from '../http/Resource';
import { get } from '../http/get';
import { FavoriteResponse } from './models/FavoriteResponse';
import { Favorite } from '../types/Favorite';

/**
 * Retrieves a list of favorites.
 * @returns {Array} An array of movie objects.
 */
export async function favoriteList(userId: string): Promise<Favorite[]> {
    const movieUrl = Resource.Get.Favorites.Movies(userId);
    const movies = await get<FavoriteResponse>(movieUrl)
        .then(response => response.data.objects);

    const seriesUrl = Resource.Get.Favorites.Series(userId);
    const series = await get<FavoriteResponse>(seriesUrl)
        .then(response => response.data.objects);

    return [...movies, ...series]
        .map(favorite => ({
            uuid: favorite.uuid,
            tvdb: favorite.id,
            title: favorite.name,
            created_at: favorite.created_at,
            type: favorite.type
        }));
}   
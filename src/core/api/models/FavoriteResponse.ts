import { MediaType } from '../../types/MediaType';

export interface FavoriteResponse {
    data: Favorites;
}

interface Favorites {
    objects: Favorite[];
}

interface Favorite {
    uuid: string;
    id: number;
    type: MediaType;
    created_at: string;
    name: string;
}
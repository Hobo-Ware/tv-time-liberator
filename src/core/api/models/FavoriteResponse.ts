export interface FavoriteResponse {
    data: Favorites;
}

interface Favorites {
    objects: Favorite[];
}

interface Favorite {
    uuid: string;
    id: number;
    type: 'series' | 'movie';
    created_at: string;
    name: string;
}
import { IMDBReference } from '../../types/IMDBReference';

export interface SeriesResponse {
    data: Show;
}

interface Show {
    id: number;
    imdb_id: IMDBReference;
    uuid: string;
    name: string;
}


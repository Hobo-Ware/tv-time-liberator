import { MediaType } from '../../types/MediaType';

export interface SeriesEntry {
    uuid: string;
    entity_type: MediaType.Show
    created_at: string;
    updated_at: string;
    meta: Meta;
    filter: string[];
}

interface Meta {
    id: number;
    name: string;
}

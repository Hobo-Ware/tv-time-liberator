import { Externalsource } from './ExternalSource';

export interface MovieEntry {
    uuid: string;
    entity_type: 'movie';
    created_at: string;
    updated_at: string;
    watched_at?: string;
    meta: Meta;
    filter: string[];
}

interface Meta {
    external_sources: Externalsource[];
    name: string;
}


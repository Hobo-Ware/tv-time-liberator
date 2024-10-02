export interface SeriesEntry {
    uuid: string;
    entity_type: 'series';
    created_at: string;
    updated_at: string;
    meta: Meta;
    filter: string[];
}

interface Meta {
    id: number;
    name: string;
}

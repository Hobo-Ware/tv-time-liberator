import { Externalsource } from './ExternalSource';

export interface MovieResponse {
    data: {
        uuid: string;
        created_at: string;
        updated_at: string;
        external_sources: Externalsource[];
        type: string;
        name: string;
        filter: string[];
    }
}
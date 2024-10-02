import { MediaType } from '../../types/MediaType';

export interface ListsResponse {
    data: List[];
}

interface List {
    name: string;
    description: string;
    is_public: boolean;
    objects: ListItem[];
}

interface ListItem {
    uuid: string;
    name: string;
    created_at: string;
    type: MediaType;
}

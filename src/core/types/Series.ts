import { MediaIdentifier } from './MediaIdentifier';
import { Season } from './Season';

export type Series = {
    id: MediaIdentifier;
    uuid: string
    title: string;
    status: 'stopped' | 'continuing' | 'up_to_date' | 'not_started_yet';
    seasons: Season[];
}
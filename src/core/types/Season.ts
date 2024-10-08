import { MediaIdentifier } from './MediaIdentifier';
import { WatchInfo } from './WatchInfo';

export type Season = {
    number: number;
    episodes: Array<{
        number: number;
        special: boolean;
        id: MediaIdentifier;
    } & WatchInfo>;
};
import { EpisodeWatchInfo } from './EpisodeWatchInfo';
import { MediaIdentifier } from './MediaIdentifier';

export type Season = {
    number: number;
    episodes: Array<{
        number: number;
        special: boolean;
        id: MediaIdentifier;
    } & EpisodeWatchInfo>;
};
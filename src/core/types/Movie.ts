import { MediaIdentifier } from './MediaIdentifier';
import { WatchInfo } from './WatchInfo';

export type Movie = {
    id: MediaIdentifier;
    uuid: string;
    title: string;
} & WatchInfo;
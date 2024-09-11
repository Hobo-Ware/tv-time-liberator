import { WatchInfo } from './WatchInfo';

export type Movie = {
    id: string;
    uuid: string;
    imdb: string;
    title: string;
} & WatchInfo;
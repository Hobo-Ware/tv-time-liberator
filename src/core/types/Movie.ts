import { WatchInfo } from './WatchInfo';

export type Movie = {
    id: string;
    title: string;
} & WatchInfo;
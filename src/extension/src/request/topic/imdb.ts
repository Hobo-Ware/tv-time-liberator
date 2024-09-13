import { emit } from '../emitter/emit';
import { Topic } from './Topic';
import type { IMDBReference } from '../models/IMDBReference';

const tvdbToImdbKey = (tvdb: number) => `tvdb-${tvdb}`;

export async function imdb(id: number, type: 'movie' | 'series'): Promise<IMDBReference> {
    const imdb = localStorage.getItem(tvdbToImdbKey(id)) as IMDBReference | null
        ?? await emit(Topic.IMDB, { type, id });

    if (imdb?.startsWith('tt')) {
        localStorage.setItem(tvdbToImdbKey(id), imdb);
    }

    return imdb as IMDBReference;
}
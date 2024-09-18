import { emit } from '../emitter/emit';
import { Topic } from './Topic';
import type { IMDBReference } from '../models/IMDBReference';
import type { DereferrerOptions } from '../../../../core/api';

const tvdbToImdbKey = (tvdb: number) => `tvdb-${tvdb}`;

export async function imdb(options: DereferrerOptions): Promise<IMDBReference> {
    const id = options.type === 'episode'
        ? options.episodeId
        : options.id;

    const imdb = localStorage.getItem(tvdbToImdbKey(id)) as IMDBReference | null
        ?? await emit(Topic.IMDB, options);

    if (imdb !== '-1') {
        localStorage.setItem(tvdbToImdbKey(id), imdb);
    }

    return imdb as IMDBReference;
}
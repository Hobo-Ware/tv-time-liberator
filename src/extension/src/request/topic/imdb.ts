import { emit } from '../emitter/emit';
import { Topic } from './Topic';
import type { DereferrerOptions } from '../../../../core/api';
import type { IMDBReference } from '../../../../core/types/IMDBReference';
import { LocalStore } from '../../store';

const tvdbToImdbKey = (tvdb: number) => `tvdb-${tvdb}`;

export async function imdb(options: DereferrerOptions): Promise<IMDBReference> {
    const id = options.type === 'episode'
        ? options.episodeId
        : options.id;

    const imdb = await LocalStore.get<IMDBReference>(tvdbToImdbKey(id))
        ?? await emit(Topic.IMDB, options);

    if (imdb !== '-1') {
        await LocalStore.set(tvdbToImdbKey(id), imdb);
    }

    return imdb as IMDBReference;
}
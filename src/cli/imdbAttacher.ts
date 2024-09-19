import { toIMDB } from '../core/api';
import { Movie } from '../core/types/Movie';
import { Series } from '../core/types/Series';
import { PersistentStore, TvTimeValue } from './store';
import { imdbAttacher as attacher } from '../core/utils/imdbAttacher';
import { IMDBReference } from '../core/types/IMDBReference';

export function imdbAttacher(list: Array<Movie | Series>, type: 'movie'): Promise<Array<Movie>>;
export function imdbAttacher(list: Array<Movie | Series>, type: 'series'): Promise<Array<Series>>;
export async function imdbAttacher(list: Array<Movie | Series>, type: 'movie' | 'series') {
    return attacher(list, type, async (options) => {
        const tvdb = options.type === 'episode'
            ? options.episodeId
            : options.id;

        const imdb = await PersistentStore.get<IMDBReference>(TvTimeValue.TvdbToImdb(tvdb))
            ?? await toIMDB(options);

        if (imdb !== '-1') {
            await PersistentStore.set<IMDBReference>(TvTimeValue.TvdbToImdb(tvdb), imdb);
        }

        return imdb;
    });
}
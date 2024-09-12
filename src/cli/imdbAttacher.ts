import { toIMDB } from '../core/api';
import { Movie } from '../core/types/Movie';
import { Series } from '../core/types/Series';
import { set, get, TvTimeValue } from './store/db';

export async function imdbAttacher(list: Array<Movie | Series>, type: 'movie' | 'series') {
    for (const media of list) {
        if (media.id.imdb === '-1') {
            media.id.imdb = await get(TvTimeValue.TvdbToImdb(media.id.tvdb)) ?? await toIMDB(media.id.tvdb, type);
            await set(TvTimeValue.TvdbToImdb(media.id.tvdb), media.id.imdb);

            if (media.id.imdb === '-1') {
                console.log(`Failed to find IMDB ID for ${media.title}!`);
            } else {
                console.log(`Succesfully found IMDB ID for ${media.title} to ${media.id.imdb}.`);
            }
        }
    }

    return list;
}
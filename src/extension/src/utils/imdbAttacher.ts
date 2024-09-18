import type { Movie } from '../../../core/types/Movie';
import type { Series } from '../../../core/types/Series';
import { imdb } from '../request/topic/imdb';
import { imdbAttacher as attacher } from '../../../core/utils/imdbAttacher';

export async function imdbAttacher(list: Array<Movie> | Array<Series>, type: 'movie' | 'series') {
    return attacher(list, type, imdb);
}
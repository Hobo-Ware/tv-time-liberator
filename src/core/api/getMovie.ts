import { request, Resource } from '../http';
import { Movie } from '../types/Movie';
import { assertDefined } from '../utils/assertDefined';
import { MovieResponse } from './models/MovieResponse';
import { toIMDB } from './toIMDB';

export async function getMovie(id: string, imdbResolver: typeof toIMDB = toIMDB): Promise<Movie> {
    const movie = await request<MovieResponse>(Resource.Get.Movie.GetByUUID(id))
        .then(response => response.data);

    const tvdb = assertDefined(
        movie
            .external_sources
            .find(source => source.source === 'tvdb'),
        'TVDB identifier not found.',
    ).id;

    return {
        id: {
            tvdb: parseInt(tvdb),
            imdb: await imdbResolver({ id: parseInt(tvdb), type: 'movie' }),
        },
        created_at: movie.created_at,
        uuid: movie.uuid,
        title: movie.name,
        is_watched: false,
    };
}
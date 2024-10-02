import { request, Resource } from '../http';
import { Movie } from '../types/Movie';
import { assertDefined } from '../utils/assertDefined';
import { MovieResponse } from './models/MovieResponse';
import { toIMDB } from './toIMDB';

type GetMovieOptions = {
    id: string;
    imdbResolver?: typeof toIMDB;
}

export async function getMovie({
    id,
    imdbResolver = toIMDB,
}: GetMovieOptions): Promise<Omit<Movie, 'is_watched'>> {
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
            imdb: await imdbResolver({
                id: parseInt(tvdb),
                type: 'movie'
            }),
        },
        created_at: movie.created_at,
        uuid: movie.uuid,
        title: movie.name,
    };
}
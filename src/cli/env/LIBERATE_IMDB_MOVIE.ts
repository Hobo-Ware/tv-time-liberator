const value = process.env.LIBERATE_IMDB_MOVIE;

if (value == null) {
    console.warn('LIBERATE_IMDB_MOVIE not set (default=true), IMDB ids will be resolved.');
}

const LIBERATE_IMDB_MOVIE = value == null || value === 'true';

export { LIBERATE_IMDB_MOVIE };
const value = import.meta.env.LIBERATE_IMDB_SHOW;

if (value == null) {
    console.warn('LIBERATE_IMDB_SHOW not set (default=false), IMDB ids will be resolved to -1.');
}
const LIBERATE_IMDB_SHOW = value === 'true';

export { LIBERATE_IMDB_SHOW };
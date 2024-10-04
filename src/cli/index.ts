import { followedMovies, followedShows, favoriteList, myLists } from '../core/api';
import { writeFile, mkdir } from 'fs/promises';
import { login } from './login';
import { setAuthorizationHeader } from '../core/http/setAuthorizationHeader';
import { setCache } from '../core/http';
import { PersistentStore } from './store';
import progress from 'cli-progress';

const reporter = new progress.SingleBar({
    format: '{bar} {percentage}% | {category} \t| ETA: {estimated}s | {message} ',
    autopadding: true,
    barCompleteChar: '\u2588',
}, progress.Presets.shades_classic);

const username = process.env.TV_TIME_USERNAME;
if (!username) {
    console.error('Please provide TV_TIME_USERNAME environment variable.');
    process.exit(1);
}

const password = process.env.TV_TIME_PASSWORD;
if (!password) {
    console.error('Please provide TV_TIME_PASSWORD environment variable.');
    process.exit(1);
}

const { userId, token } = await login(username, password);

setAuthorizationHeader(token);
setCache(PersistentStore);

const exportDir = '.export';
await mkdir(exportDir, { recursive: true });

const configFactory = (category = '') => {
    reporter.start(1, 0, { category, ...reporterDefaultPayload });

    return {
        userId,
        onProgress: ({ value: { current }, message, estimated }) => {
            reporter.update(current, { message, estimated });

            if (current === 1) {
                reporter.stop();
            }
        },
    };
};

const reporterDefaultPayload = {
    estimated: 0,
    message: '',
}

const movies = await followedMovies(configFactory('Movies'));
await writeFile('.export/movies.json', JSON.stringify(movies, null, 4))

const shows = await followedShows(configFactory('Series'));
await writeFile('.export/shows.json', JSON.stringify(shows, null, 4));

const favorites = await favoriteList(configFactory('Faves'));
await writeFile('.export/favorites.json', JSON.stringify(favorites, null, 2));

const lists = await myLists(configFactory('Lists'));
await writeFile('.export/lists.json', JSON.stringify(lists, null, 2));
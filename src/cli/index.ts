import { followedMovies, followedSeries } from '../core/api';
import { writeFile, mkdir } from 'fs/promises';
import { login } from './login';
import { setAuthorizationHeader } from '../core/http/setAuthorizationHeader';
import { favoriteList } from '../core/api/favoriteList';
import { myLists } from '../core/api/myLists';
import { setCache } from '../core/http';
import { PersistentStore } from './store';

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

const movies = await followedMovies(userId);
await writeFile('.export/movies.json', JSON.stringify(movies, null, 4))

const series = await followedSeries(userId);
await writeFile('.export/series.json', JSON.stringify(series, null, 4));

const favorites = await favoriteList(userId);
await writeFile('.export/favorites.json', JSON.stringify(favorites, null, 2));

const lists = await myLists(userId);
await writeFile('.export/lists.json', JSON.stringify(lists, null, 2));
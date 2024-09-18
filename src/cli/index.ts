import './setup';

import { followedMovies, followedSeries, toIMDB } from '../core/api';
import { writeFile, mkdir } from 'fs/promises';
import { MemoryStorage, WellKnownItem } from '../core/store/MemoryStorage';
import { login } from './login';
import { setAuthorizationHeader } from '../core/http/setAuthorizationHeader';
import { imdbAttacher } from './imdbAttacher';
import { favoriteList } from '../core/api/favoriteList';
import { listMapper } from '../core/utils/listMapper';
import { myLists } from '../core/api/myLists';
const username = MemoryStorage.get(WellKnownItem.Username);
const password = MemoryStorage.get(WellKnownItem.Password);

const { userId, token } = await login(username, password);

setAuthorizationHeader(token);

const exportDir = '.export';
await mkdir(exportDir, { recursive: true });

const movies = await imdbAttacher(await followedMovies(userId), 'movie');
await writeFile('.export/movies.json', JSON.stringify(movies, null, 4))

const series = await imdbAttacher(await followedSeries(userId), 'series');
await writeFile('.export/series.json', JSON.stringify(series, null, 4));

const favorites = await favoriteList(userId)
    .then(favorites => listMapper({
        movies,
        series,
        list: favorites,
    }));
await writeFile('.export/favorites.json', JSON.stringify(favorites, null, 2));

const lists = await myLists(userId)
    .then(lists => lists
        .map(list => ({
            ...listMapper({
                movies,
                series,
                list: list.items,
            }),
            name: list.name,
            description: list.description,
        })));
await writeFile('.export/lists.json', JSON.stringify(lists, null, 2));
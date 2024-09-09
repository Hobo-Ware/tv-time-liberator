import './setup';

import { followedMovies, followedSeries, infoSeries } from '../core/api';
import { writeFile, mkdir } from 'fs/promises';
import { MemoryStorage, WellKnownItem } from '../core/store/MemoryStorage';
import { login } from './login';
import { setAuthorizationHeader } from '../core/http/setAuthorizationHeader';

const username = MemoryStorage.get(WellKnownItem.Username);
const password = MemoryStorage.get(WellKnownItem.Password);

const { userId, token } = await login(username, password);

setAuthorizationHeader(token);

const exportDir = '.export';
await mkdir(exportDir, { recursive: true });

const movies = await followedMovies(userId);
await writeFile('.export/movies.json', JSON.stringify(movies, null, 4));

const series = await followedSeries(userId);
await writeFile('.export/series.json', JSON.stringify(series, null, 4));

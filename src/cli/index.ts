import './setup';

import { followedMovies, followedSeries, toIMDB } from '../core/api';
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
for (const movie of movies) {
    if (movie.imdb === '-1') {
        movie.imdb = await toIMDB(movie.id, 'movie');

        if (movie.imdb === '-1') {
            console.log(`Failed to find IMDB ID for ${movie.title}`);
        }

        console.log(`Succesfully found IMDB ID for ${movie.title} to ${movie.imdb}`);
    }
}
await writeFile('.export/movies.json', JSON.stringify(movies, null, 4))

const series = await followedSeries(userId);
await writeFile('.export/series.json', JSON.stringify(series, null, 4));


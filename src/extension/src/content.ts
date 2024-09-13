import browser from 'webextension-polyfill';
import { followedMovies, followedSeries } from '../../core/api';
import { setAuthorizationHeader } from '../../core/http/setAuthorizationHeader';
import { download } from './utils/download';
import { imdbAttacher } from './utils/imdbAttacher';
import { listener } from './request/listener/listener';
import { Topic } from './request/topic/Topic';

console.log('--- TV Time Liberator Loaded ---');

function readUser(): { login: string, name: string } {
    return JSON.parse(JSON.parse(localStorage.getItem('flutter.user')!));
}

function readToken(): string {
    return localStorage.getItem('flutter.jwtToken')!.slice(1, -1);
}

async function extract() {
    const user: { login: string } = readUser();
    setAuthorizationHeader(readToken());

    console.log('Extracting...');

    const movies = await imdbAttacher(await followedMovies(user.login), 'movie');
    download('movies.json', JSON.stringify(movies, null, 2));

    const series = await imdbAttacher(await followedSeries(user.login), 'series');
    download('series.json', JSON.stringify(series, null, 2));
}

function isAuthorized(): boolean {
    const user = readUser();
    return !!user.name && user.name !== 'Anonymous';
}

listener(Topic.Export, async () => {
    await extract()
        .catch(console.error);
});

listener(Topic.CheckAuthorization, () => {
    return isAuthorized();
});

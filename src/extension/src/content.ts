import { followedMovies, followedSeries, favoriteList, myLists } from '../../core/api';
import { setAuthorizationHeader } from '../../core/http/setAuthorizationHeader';
import { download } from './utils/download';
import { listener } from './request/listener/listener';
import { Topic } from './request/topic/Topic';
import { imdb } from './request/topic/imdb';
import { setCache } from '../../core/http';
import { LocalStore } from './store';

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
    setCache(LocalStore);

    console.log('Extracting...');

    const movies = await await followedMovies(user.login, imdb);
    download('movies.json', JSON.stringify(movies, null, 2));

    const series = await followedSeries(user.login, imdb);
    download('series.json', JSON.stringify(series, null, 2));

    const favorites = await favoriteList(user.login, imdb);
    download('favorites.json', JSON.stringify(favorites, null, 2));

    const lists = await myLists(user.login, imdb);
    download('lists.json', JSON.stringify(lists, null, 2));
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

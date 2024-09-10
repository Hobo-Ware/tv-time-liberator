import browser from 'webextension-polyfill';
import { followedMovies, followedSeries } from '../../core/api';
import { setAuthorizationHeader } from '../../core/http/setAuthorizationHeader';

const user: { login: string } = JSON.parse(JSON.parse(localStorage.getItem('flutter.user')!));
const token = localStorage.getItem('flutter.jwtToken')!.slice(1, -1);
setAuthorizationHeader(token);

async function extract() {
    console.log('Extracting...');
    const movies = await followedMovies(user.login);
    const series = await followedSeries(user.login);

    console.log('Here are your followed movies and series:', {
        movies,
        series,
    });
}

browser
    .runtime
    .onMessage
    .addListener(async (message: any) => {
        if (message.type === 'extract') {
            await extract();
        }

        return true;
    });

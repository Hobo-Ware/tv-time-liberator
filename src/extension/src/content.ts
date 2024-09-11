import browser from 'webextension-polyfill';
import { followedMovies, followedSeries } from '../../core/api';
import { setAuthorizationHeader } from '../../core/http/setAuthorizationHeader';

console.log('--- TV Time Liberator Loaded ---');

const user: { login: string } = JSON.parse(JSON.parse(localStorage.getItem('flutter.user')!));
const token = localStorage.getItem('flutter.jwtToken')!.slice(1, -1);
setAuthorizationHeader(token);

function requestIMDB(id: string): Promise<string> {
    return browser
        .runtime
        .sendMessage({
            type: 'imdb',
            id,
        });
}

async function extract() {
    console.log('Extracting...');
    const movies = await followedMovies(user.login);

    for (const movie of movies) {
        if (movie.imdb === '-1') {
            movie.imdb = await requestIMDB(movie.id);

            if (movie.imdb === '-1') {
                console.log(`Failed to find IMDB ID for ${movie.title}`);
            }

            console.log(`Succesfully found IMDB ID for ${movie.title} to ${movie.imdb}`);
        }
    }

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

import browser from 'webextension-polyfill';
import { followedMovies, followedSeries } from '../../core/api';
import { setAuthorizationHeader } from '../../core/http/setAuthorizationHeader';

console.log('--- TV Time Liberator Loaded ---');

const user: { login: string } = JSON.parse(JSON.parse(localStorage.getItem('flutter.user')!));
const token = localStorage.getItem('flutter.jwtToken')!.slice(1, -1);
setAuthorizationHeader(token);

const tvdbToImdbKey = (tvdb: number) => `tvdb-${tvdb}`;

function requestIMDB(id: number): Promise<`tt${string}` | '-1'> {
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
        if (movie.id.imdb === '-1') {
            movie.id.imdb = await requestIMDB(movie.id.tvdb);

            if (movie.id.imdb === '-1') {
                console.log(`Failed to find IMDB ID for ${movie.title}`);
            }

            console.log(`Succesfully found IMDB ID for ${movie.title} to ${movie.id.imdb}`);
        }
    }

    const series = await followedSeries(user.login);

    for (const media of [...movies, ...series]) {
        if (media.id.imdb === '-1') {
            const key = tvdbToImdbKey(media.id.tvdb);
            media.id.imdb = localStorage.get(key) ?? await requestIMDB(media.id.tvdb);
            localStorage.set(key, media.id.imdb);
    
            if (media.id.imdb === '-1') {
                console.log(`Failed to find IMDB ID for ${media.title}!`);
            }
    
            console.log(`Succesfully found IMDB ID for ${media.title} to ${media.id.imdb}.`);
        }
    }

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

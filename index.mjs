import './setup.mjs';

import { EOL } from 'os';
import { login, followedMovies, followedSeries, infoSeries } from './api/index.mjs';
import { writeFile } from 'fs/promises';

function logList(title, list) {
    console.log(EOL, `-- ${title}: ${EOL}`);
    console.log(list.map(item => `\t - ${item.meta.name}`).join(EOL));
}

const [username, password] = process.env.TVTIME_CREDENTIALS.split(';');

await login(username, password);

const movies = await followedMovies();
writeFile('.export/movies.json', JSON.stringify(movies, null, 4));

const unwatchedMovies = movies.filter(movie => movie.watched_at == null);
logList('Unwatched movies', unwatchedMovies);

const series = await followedSeries();
writeFile('.export/series.json', JSON.stringify(series, null, 4));

const abandonedSeries = series.filter(serie => serie.filter.includes('stopped'));
logList('Abandoned series', abandonedSeries);

const unwatchedSeries = series.filter(serie => serie.filter.includes('continuing'));
logList('Unwatched series', unwatchedSeries);

const upToDateSeries = series.filter(serie => serie.filter.includes('up_to_date'));
logList('Up to date series', upToDateSeries);

const notStartedSeries = series.filter(serie => serie.filter.includes('not_started_yet'));
logList('Not started series', notStartedSeries);

const [randomSeries] = unwatchedSeries.sort(() => Math.random() - 0.5);
const name = randomSeries.meta.name;
console.log(EOL, '-- Checking status for: ', name);

const info = await infoSeries(randomSeries.meta.id);
const { seasons } = info;

for (const { episodes, number } of seasons) {
    if (number === 0) {
        // Skip specials for demo purposes
        continue;
    }

    const isEntireSeasonWatched = episodes
        .every(episode => episode.is_watched);

    if (isEntireSeasonWatched) {
        console.log(`\t - Season ${number} is was completely watched!`);
        continue;
    }

    const notWatchedEpisodes = episodes
        .filter(episode => !episode.is_watched);

    console.log(`\t - Season ${number} has ${notWatchedEpisodes.length} unwatched episodes.`);
}

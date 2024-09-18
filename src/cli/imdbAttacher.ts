import { toIMDB } from '../core/api';
import { Movie } from '../core/types/Movie';
import { Series } from '../core/types/Series';
import { set, get, TvTimeValue } from './store/db';

export async function imdbAttacher(list: Array<Movie | Series>, type: 'movie' | 'series') {
    for (const media of list) {
        if (type === 'series') {
            for (const season of (media as Series).seasons) {
                for (const episode of season.episodes) {
                    if (episode.id.imdb === '-1') {
                        episode.id.imdb = await get(TvTimeValue.TvdbToImdb(episode.id.tvdb))
                            ?? await toIMDB({
                                showId: media.id.tvdb,
                                episodeId: episode.id.tvdb,
                                type: 'episode',
                            });

                        if (episode.id.imdb === '-1') {
                            console.log(`Failed to find IMDB ID for ${media.title} - Season ${season.number} Episode ${episode.number}!`);
                        } else {
                            await set(TvTimeValue.TvdbToImdb(episode.id.tvdb), episode.id.imdb);
                            console.log(`Succesfully found IMDB ID for ${media.title} - Season ${season.number} Episode ${episode.number}!`);
                        }
                    }
                }
            }
        }

        media.id.imdb = await get(TvTimeValue.TvdbToImdb(media.id.tvdb)) ?? await toIMDB({
            id: media.id.tvdb,
            type,
        });


        if (media.id.imdb === '-1') {
            console.log(`Failed to find IMDB ID for ${media.title}!`);
        } else {
            await set(TvTimeValue.TvdbToImdb(media.id.tvdb), media.id.imdb);
            console.log(`Succesfully found IMDB ID for ${media.title} to ${media.id.imdb}.`);
        }
    }

    return list;
}
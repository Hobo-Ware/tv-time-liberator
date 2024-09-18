import type { Movie } from '../../../core/types/Movie';
import type { Series } from '../../../core/types/Series';
import { imdb } from '../request/topic/imdb';

export async function imdbAttacher(list: Array<Movie | Series>, type: 'movie' | 'series') {
    for (const media of list) {
        if (type === 'series') {
            for (const season of (media as Series).seasons) {
                for (const episode of season.episodes) {
                    episode.id.imdb = await imdb({
                        episodeId: episode.id.tvdb,
                        showId: media.id.tvdb,
                        type: 'episode'
                    });
                }
            }
        }

        if (media.id.imdb === '-1') {
            media.id.imdb = await imdb({
                type,
                id: media.id.tvdb
            });

            if (media.id.imdb === '-1') {
                console.log(`Failed to find IMDB ID for ${media.title}!`);
            } else {
                console.log(`Succesfully found IMDB ID for ${media.title} to ${media.id.imdb}.`);
            }
        }
    }

    return list;
}
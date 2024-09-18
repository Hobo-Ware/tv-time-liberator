
import type { DereferrerOptions } from '../api';
import type { MediaIdentifier } from '../types/MediaIdentifier';
import type { Movie } from '../types/Movie'
import type { Series } from '../types/Series';

type IMDB = MediaIdentifier['imdb'];

async function resolveEpisodes(
    series: Series,
    resolver: (options: DereferrerOptions) => Promise<IMDB>,
) {
    for (const season of series.seasons) {
        for (const episode of season.episodes) {
            episode.id.imdb = await resolver({
                showId: series.id.tvdb,
                episodeId: episode.id.tvdb,
                type: 'episode',
            });

            episode.id.imdb === '-1'
                ? console.log(`Failed to find IMDB ID for ${series.title} - Season ${season.number} Episode ${episode.number}!`)
                : console.log(`Succesfully found IMDB ID for ${series.title} - Season ${season.number} Episode ${episode.number}!`)
        }
    }
}

export async function imdbAttacher(
    list: Array<Movie | Series>,
    type: 'movie' | 'series',
    resolver: (options: DereferrerOptions) => Promise<IMDB>
): Promise<Array<Movie | Series>> {
    for (const media of list) {
        if (type === 'series') {
            await resolveEpisodes(media as Series, resolver);
        }

        media.id.imdb = await resolver({
            id: media.id.tvdb,
            type,
        });


        media.id.imdb === '-1'
            ? console.log(`Failed to find IMDB ID for ${media.title}!`)
            : console.log(`Succesfully found IMDB ID for ${media.title} to ${media.id.imdb}.`)
    }
    return Promise.resolve(list);
}
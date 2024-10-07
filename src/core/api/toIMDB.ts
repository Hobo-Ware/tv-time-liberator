import { assertDefined } from '../utils/assertDefined';
import type { IMDBReference, IMDBUndefined } from '../types/IMDBReference';
import { request } from '../http';
import { LIBERATE_IMDB_MOVIE } from '../../cli/env/LIBERATE_IMDB_MOVIE';
import { LIBERATE_IMDB_SHOW } from '../../cli/env/LIBERATE_IMDB_SHOW';

export type DereferrerOptions = {
    id: number;
    type: 'movie' | 'show';
} | {
    showId: number;
    episodeId: number;
    type: 'episode';
};

async function dereferrer(options: DereferrerOptions): Promise<string> {
    const { type } = options;

    if (type === 'episode') {
        const response = await fetch(await dereferrer({ id: options.showId, type: 'show' }), { method: 'HEAD' });
        const location = response.url;
        return `${location}/episodes/${options.episodeId}`;
    }

    const { id } = options;

    if (type === 'movie') {
        return `https://www.thetvdb.com/dereferrer/movie/${options.id}`;
    }

    return `https://www.thetvdb.com/dereferrer/series/${id}`;
}

export async function toIMDB(options: DereferrerOptions): Promise<IMDBReference> {
    if (!LIBERATE_IMDB_MOVIE && options.type === 'movie') {
        return '-1' as IMDBUndefined;
    }

    if (!LIBERATE_IMDB_SHOW && options.type === 'show') {
        return '-1' as IMDBUndefined;
    }

    return request<string>(await dereferrer(options), {
        headers: {
            Authorization: '',
        },
        responseType: 'text',
    })
        .then(doc => {
            const regex = /https:\/\/www\.imdb\.com\/title\/(tt\d+)\//;
            const [, imdb] = doc.match(regex) || [];
            return assertDefined(imdb as IMDBReference, `IMDB ID not found for ${JSON.stringify(options)}.`);
        })
        .catch(() => '-1' as IMDBUndefined);
}

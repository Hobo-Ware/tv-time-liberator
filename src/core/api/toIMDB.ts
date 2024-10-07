import type { HTMLElement } from 'node-html-parser';
import { assertDefined } from '../utils/assertDefined';
import type { IMDBReference, IMDBUndefined } from '../types/IMDBReference';
import { request } from '../http';
import { LIBERATE_IMDB_MOVIE } from '../../cli/env/LIBERATE_IMDB_MOVIE';
import { LIBERATE_IMDB_SHOW } from '../../cli/env/LIBERATE_IMDB_SHOW';

async function parseHtml(html: string): Promise<HTMLElement> {
    if (globalThis.DOMParser) {
        const parser = new DOMParser();
        const document = parser.parseFromString(html, 'text/html');
        return document.body as unknown as HTMLElement;
    }

    return import('node-html-parser')
        .then(({ parse }) => {
            return parse(html) as HTMLElement;
        });
}

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
        .then(markup => parseHtml(markup))
        .then(doc => {
            const imdbRef = assertDefined(doc.querySelector('a[href^="https://www.imdb.com/title/"]'), 'IMDB reference not found.');

            const regex = /https:\/\/www\.imdb\.com\/title\/(tt\d+)\//;
            const [, imdb] = imdbRef.getAttribute('href')?.match(regex) || [];
            return assertDefined(imdb as IMDBReference, `IMDB ID not found for ${JSON.stringify(options)}.`);
        })
        .catch(() => '-1' as IMDBUndefined);
}



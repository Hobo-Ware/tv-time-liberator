import type { HTMLElement } from 'node-html-parser';
import axios from 'axios';
import { assertDefined } from '../utils/assertDefined';
import { IMDBReference, IMDBUndefined } from '../types/IMDBReference';

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
    type: 'movie' | 'series';
} | {
    showId: number;
    episodeId: number;
    type: 'episode';
};

async function dereferrer(options: DereferrerOptions): Promise<string> {
    const { type } = options;

    if (type === 'episode') {
        const response = await fetch(await dereferrer({ id: options.showId, type: 'series' }), { method: 'HEAD' });
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
    return axios.get(await dereferrer(options), {
        headers: {
            Authorization: '',
        }
    })
        .then(response => parseHtml(response.data))
        .then(doc => {
            const imdbRef = assertDefined(doc.querySelector('a[href^="https://www.imdb.com/title/"]'), 'IMDB reference not found.');

            const regex = /https:\/\/www\.imdb\.com\/title\/(tt\d+)\//;
            const [, imdb] = imdbRef.getAttribute('href')?.match(regex) || [];
            return assertDefined(imdb as IMDBReference, `IMDB ID not found for ${JSON.stringify(options)}.`);
        })
        .catch(() => '-1' as IMDBUndefined);
}

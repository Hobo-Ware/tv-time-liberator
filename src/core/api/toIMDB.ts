import type { HTMLElement } from 'node-html-parser';
import axios from 'axios';
import { assertDefined } from '../utils/assertDefined';

type MediaType = 'movie' | 'series';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

function dereferrer(id: string, type: MediaType): string {
    if (type === 'movie') {
        return `https://www.thetvdb.com/dereferrer/movie/${id}`;
    }

    return `https://www.thetvdb.com/dereferrer/series/${id}`;
}

export function toIMDB(id: string, type: 'movie' | 'series') {
    return axios.get(dereferrer(id, type), {
        headers: {
            Authorization: '',
        }
    })
        .then(response => parseHtml(response.data))
        .then(doc => {
            const imdbRef = assertDefined(doc.querySelector('a[href^="https://www.imdb.com/title/"]'), 'IMDB reference not found.');

            const regex = /https:\/\/www\.imdb\.com\/title\/(tt\d+)\//;
            const [, imdb] = imdbRef.getAttribute('href')?.match(regex) || [];
            return assertDefined(imdb, `IMDB ID not found for ${id}.`);
        })
        .catch(() => '-1');
}

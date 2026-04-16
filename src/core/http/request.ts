import { retryAsync } from 'ts-retry';
import { sha256 } from '../utils/sha256';
import { authorizationHeader } from './internal/authorizationHeader';
import { cache } from './internal/cache';

type RequestOptions = {
    headers?: Record<string, string>;
    responseType?: 'json' | 'text';
};

const PAGE_LIMIT = 500;

const cacheWarning = { isWarned: false };

const isErrorResponse = (response: any) => {
    return response instanceof Object
        && 'status' in response &&
        ['error', 'fail'].includes(response.status);
}

export async function request<T>(url: string, options: RequestOptions = { responseType: 'json' }): Promise<T> {
    const key = await sha256(url);

    try {
        if (cache.instance == null && !cacheWarning.isWarned) {
            console.warn('--- Cache is not configured. Consider using setCache() to set a cache instance.');
            cacheWarning.isWarned = true;
        }

        const cached = await cache.instance?.get<T>(key);

        if (cached != null && !isErrorResponse(cached)) {
            return cached;
        }

        const reponse = await retryAsync(
            () => fetch(url, {
                headers: {
                    'page-limit': String(PAGE_LIMIT),
                    ...authorizationHeader,
                    ...(options.headers || {}),
                },
            }).then(
                res => options.responseType === 'json'
                    ? res.json()
                    : res.text()
            ).then(response => {
                if (isErrorResponse(response)) {
                    return Promise.reject(response?.message);
                }

                return response;
            }),
            {
                maxTry: 10,
                delay: 3500,
            });

        if (reponse?.status !== 'error') {
            await cache.instance?.set(key, reponse);
        }

        return reponse;
    } catch (error: any) {
        console.error({
            message: error?.message,
            status: error?.status,
        });

        throw error;
    }
}

/**
 * Fetches all pages of a paginated TV Time API endpoint that returns
 * `{ data: { objects: T[] } }`, stopping when a page returns fewer items
 * than PAGE_LIMIT or an empty array.
 *
 * @param urlFactory - Function that accepts a 1-based page number and returns the URL.
 * @param onPage - Optional callback invoked after each page is fetched, with the current page number and running total.
 */
export async function paginatedRequest<T>(
    urlFactory: (page: number) => string,
    onPage?: (page: number, total: number) => void,
): Promise<T[]> {
    const all: T[] = [];
    let page = 1;

    while (true) {
        const response = await request<{ data: { objects: T[] } }>(urlFactory(page));
        const objects = response?.data?.objects ?? [];

        all.push(...objects);
        onPage?.(page, all.length);

        if (objects.length < PAGE_LIMIT) break;
        page++;
    }

    return all;
}

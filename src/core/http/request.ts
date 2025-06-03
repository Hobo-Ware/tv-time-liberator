import { retryAsync } from 'ts-retry';
import { authorizationHeader } from './internal/authorizationHeader';
import { cache } from './internal/cache';
import { sha256 } from '../utils/sha256';

type RequestOptions = {
    headers?: Record<string, string>;
    responseType?: 'json' | 'text';
};

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
                    'page-limit': '500',
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

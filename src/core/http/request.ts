import { retryAsync } from 'ts-retry';
import { authorizationHeader } from './internal/authorizationHeader';
import { cache } from './internal/cache';

type RequestOptions = {
    headers?: Record<string, string>;
    responseType?: 'json' | 'text';
};

const cacheWarning = { isWarned: false };

async function sha256(source: string): Promise<string> {
    const sourceBytes = new TextEncoder().encode(source);
    const digest = await crypto.subtle.digest("SHA-256", sourceBytes);
    const resultBytes = [...new Uint8Array(digest)];
    return resultBytes.map(x => x.toString(16).padStart(2, '0')).join('');
}

export async function request<T>(url: string, options: RequestOptions = { responseType: 'json' }): Promise<T> {
    const key = await sha256(url);

    try {
        if (cache.instance == null && !cacheWarning.isWarned) {
            console.warn('--- Cache is not configured. Consider using setCache() to set a cache instance.');
            cacheWarning.isWarned = true;
        }

        const cached = await cache.instance?.get<T>(key);

        if (cached != null) {
            return cached;
        }

        const reponse = await retryAsync(
            () => fetch(url, {
                headers: {
                    ...authorizationHeader,
                    ...(options.headers || {}),
                },
            }),
            {
                maxTry: 10,
                delay: 3500,
                onError: () => {
                    console.log(`Retrying GET request to ${url}...`);
                },
            })
            .then(
                res => options.responseType === 'json'
                    ? res.json()
                    : res.text()
            );

        await cache.instance?.set(key, reponse);

        return reponse;
    } catch (error: any) {
        console.error({
            message: error?.message,
            status: error?.status,
        });

        throw error;
    }
}

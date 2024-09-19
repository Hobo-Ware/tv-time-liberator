import type { Store } from '../../../core/store';

const safeParse = <T>(value: string | null): T | undefined => {
    try {
        return JSON.parse(value ?? '');
    } catch {
        return undefined;
    }
}

export const LocalStore: Store = {
    get: async function <T>(key: string): Promise<T | undefined> {
        return Promise.resolve(safeParse(localStorage.getItem(key) ?? '') as T | undefined);
    },
    set: async function <T>(key: string, value: T): Promise<void> {
        localStorage.setItem(key, JSON.stringify(value));
        return Promise.resolve();
    },
    has: async function (key: string): Promise<boolean> {
        return Promise.resolve(localStorage.getItem(key) !== null);
    },
    delete: function (key: string): Promise<void> {
        localStorage.removeItem(key);
        return Promise.resolve();
    },
    clear: function (): Promise<void> {
        localStorage.clear();
        return Promise.resolve();
    }
}
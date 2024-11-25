import type { Store } from "../../../core/store";

const DB_NAME = "LIBERATOR_DB";
const STORE_NAME = "MEDIA_STORE";
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const withStore = async (
    type: IDBTransactionMode,
    callback: (store: IDBObjectStore) => void,
): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, type);
    const store = transaction.objectStore(STORE_NAME);
    callback(store);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

const safeParse = <T>(value: string | null): T | undefined => {
    try {
        return JSON.parse(value ?? "");
    } catch {
        return undefined;
    }
};

const migrateFromLocalStorage = async (key: string): Promise<void> => {
    const value = localStorage.getItem(key);
    if (value !== null) {
        await withStore("readwrite", (store) => {
            store.put(safeParse(value), key);
        });
        localStorage.removeItem(key);
    }
};

export const LocalStore: Store = {
    get: async function <T>(key: string): Promise<T | undefined> {
        await migrateFromLocalStorage(key);
        return new Promise<T | undefined>((resolve, reject) => {
            withStore("readonly", (store) => {
                const request = store.get(key);
                request.onsuccess = () =>
                    resolve(request.result as T | undefined);
                request.onerror = () => reject(request.error);
            });
        });
    },
    set: async function <T>(key: string, value: T): Promise<void> {
        await withStore("readwrite", (store) => {
            store.put(value, key);
        });
    },
    has: async function (key: string): Promise<boolean> {
        await migrateFromLocalStorage(key);
        return new Promise<boolean>((resolve, reject) => {
            withStore("readonly", (store) => {
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result !== undefined);
                request.onerror = () => reject(request.error);
            });
        });
    },
    delete: async function (key: string): Promise<void> {
        await withStore("readwrite", (store) => {
            store.delete(key);
        });
    },
    clear: async function (): Promise<void> {
        await withStore("readwrite", (store) => {
            store.clear();
        });
    },
};

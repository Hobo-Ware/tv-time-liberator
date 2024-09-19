import { Store } from '../../core/store/Store';
import { FSDB } from 'file-system-db';

const db = new FSDB('.db/store.json', false);

export const PersistentStore: Store = {
    async get<T>(key: string): Promise<T | undefined> {
        return db.get(key);
    },
    async set<T>(key: string, value: T) {
        db.set(key, value);
    },
    async has(key: string) {
        return db.has(key);
    },
    async delete(key: string) {
        db.delete(key);
    },
    async clear() {
        db.deleteAll();
    }
}

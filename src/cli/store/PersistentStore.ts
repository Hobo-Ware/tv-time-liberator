import { Store } from '../../core/store/Store';
import { FSDB } from 'file-system-db';
import { readFile } from 'fs/promises';
import { MemoryDB } from './MemoryDB';

const db = new FSDB('.db/store.json', false);
const memory = new MemoryDB(
    await readFile(db.path ?? '', 'utf-8')
        .then(JSON.parse)
        .catch(() => { })
)

export const PersistentStore: Store = {
    async get<T>(key: string): Promise<T | undefined> {
        return memory.get<T>(key);
    },
    async set<T>(key: string, value: T) {
        memory.set(key, value);
        db.set(key, value);
    },
    async has(key: string) {
        return memory.has(key);
    },
    async delete(key: string) {
        memory.delete(key);
        db.delete(key);
    },
    async clear() {
        db.deleteAll();
        memory.deleteAll();
    }
}

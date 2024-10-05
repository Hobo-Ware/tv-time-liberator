import { FSDB } from 'file-system-db';
import { readFile } from 'fs/promises';
import { MemoryDB } from './MemoryDB';
import { Store } from '../../core/store';
export class PersistentStore {
    private static _instances: Record<string, Store> = {};

    static namespacedPath(namespace: string) {
        return `.db/${namespace}/store.json`;
    }

    static async create(path: string): Promise<Store> {
        if (this._instances[path] != null) {
            return this._instances[path];
        }

        const db = new FSDB(path, false);
        const memory = new MemoryDB(
            await readFile(db.path ?? '', 'utf-8')
                .then(JSON.parse)
                .catch(() => { })
        );

        return this._instances[path] = {
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
    }
}

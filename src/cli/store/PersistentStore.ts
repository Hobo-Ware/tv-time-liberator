import { FSDB } from 'file-system-db';
import { readFile, writeFile } from 'fs/promises';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { MemoryDB } from './MemoryDB';
import { Store } from '../../core/store';

// How often, at most, the in-memory store is flushed to disk while running.
// Writes are coalesced: a burst of set()/delete() calls triggers a single
// flush instead of rewriting the whole store.json on every key -- the latter
// is O(n^2) over a run and made large libraries take hours to export.
const FLUSH_INTERVAL_MS = 1500;

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
        const filePath = db.path ?? path;

        // Own the parent directory rather than relying on FSDB's side effects,
        // so flushing works regardless of how the underlying file was created.
        const dir = dirname(filePath);
        if (dir && dir !== '.') {
            try { mkdirSync(dir, { recursive: true }); } catch { }
        }

        const initial: Record<string, any> = await readFile(filePath, 'utf-8')
            .then(JSON.parse)
            .catch(() => ({})) ?? {};
        const memory = new MemoryDB(initial);

        let dirty = false;
        let pending: ReturnType<typeof setTimeout> | null = null;

        // Serialize the live in-memory state (via snapshot()) rather than a
        // captured reference, so flushes stay correct even after clear().
        const flushSync = () => {
            if (!dirty) return;
            writeFileSync(filePath, JSON.stringify(memory.snapshot()));
            dirty = false;
        };

        const scheduleFlush = () => {
            dirty = true;
            if (pending != null) return;
            pending = setTimeout(() => {
                pending = null;
                if (!dirty) return;
                const snapshot = JSON.stringify(memory.snapshot());
                dirty = false;
                writeFile(filePath, snapshot).catch(() => { dirty = true; });
            }, FLUSH_INTERVAL_MS);
        };

        // Guarantee the latest state reaches disk even on process.exit(0),
        // which the CLI calls and which skips async timers / 'beforeExit'.
        process.once('exit', flushSync);

        return this._instances[path] = {
            async get<T>(key: string): Promise<T | undefined> {
                return memory.get<T>(key);
            },
            async set<T>(key: string, value: T) {
                await memory.set(key, value);
                scheduleFlush();
            },
            async has(key: string) {
                return memory.has(key);
            },
            async delete(key: string) {
                await memory.delete(key);
                scheduleFlush();
            },
            async clear() {
                await memory.deleteAll();
                dirty = true;
                flushSync();
            }
        }
    }
}

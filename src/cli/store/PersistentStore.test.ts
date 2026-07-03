import { afterAll, describe, expect, it } from 'bun:test';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { PersistentStore } from './PersistentStore';

// FLUSH_INTERVAL_MS in PersistentStore is 1500ms; wait a bit longer so the
// debounced disk write has certainly landed before we assert on the file.
const FLUSH_WAIT_MS = 2100;
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const TMP = '.test-tmp';
let counter = 0;
const nextPath = () => `${TMP}/store-${process.pid}-${counter++}.json`;
const readDisk = (path: string) => JSON.parse(readFileSync(path, 'utf-8'));

afterAll(() => {
    try { rmSync(TMP, { recursive: true, force: true }); } catch { }
});

describe('PersistentStore', () => {
    it('serves values from memory immediately after set', async () => {
        const store = await PersistentStore.create(nextPath());
        await store.set('a', 1);
        await store.set('b', { nested: true });
        expect(await store.get('a')).toBe(1);
        expect(await store.get<{ nested: boolean }>('b')).toEqual({ nested: true });
        expect(await store.has('a')).toBe(true);
        expect(await store.has('missing')).toBe(false);
    });

    it('flushes all keys to disk after the debounce interval', async () => {
        const path = nextPath();
        const store = await PersistentStore.create(path);
        for (let i = 0; i < 50; i++) {
            await store.set(`k${i}`, i);
        }
        await wait(FLUSH_WAIT_MS);
        const onDisk = readDisk(path);
        expect(Object.keys(onDisk)).toHaveLength(50);
        expect(onDisk.k0).toBe(0);
        expect(onDisk.k49).toBe(49);
    });

    it('coalesces a burst of writes into a consistent final state on disk', async () => {
        const path = nextPath();
        const store = await PersistentStore.create(path);
        // Many rapid writes (like request.ts caching many responses) must not
        // lose data even though they are collapsed into few disk writes.
        for (let i = 0; i < 200; i++) {
            await store.set(`k${i}`, { v: i });
        }
        await store.delete('k0');
        await wait(FLUSH_WAIT_MS);
        const onDisk = readDisk(path);
        expect(onDisk.k0).toBeUndefined();
        expect(onDisk.k199).toEqual({ v: 199 });
        expect(Object.keys(onDisk)).toHaveLength(199);
    });

    it('clear() empties the store on disk (no stale data)', async () => {
        const path = nextPath();
        const store = await PersistentStore.create(path);
        await store.set('a', 1);
        await store.set('b', 2);
        await wait(FLUSH_WAIT_MS);
        expect(Object.keys(readDisk(path))).toHaveLength(2);

        await store.clear();
        // clear() flushes synchronously; disk must be empty right away.
        expect(readDisk(path)).toEqual({});
        expect(await store.get('a')).toBeUndefined();
    });

    it('loads existing data from disk on create', async () => {
        const path = nextPath();
        writeFileSync(path, JSON.stringify({ pre: 'existing', n: 7 }));
        const store = await PersistentStore.create(path);
        expect(await store.get('pre')).toBe('existing');
        expect(await store.get('n')).toBe(7);
    });

    it('returns the same instance for the same path', async () => {
        const path = nextPath();
        const a = await PersistentStore.create(path);
        const b = await PersistentStore.create(path);
        expect(a).toBe(b);
        expect(existsSync(TMP)).toBe(true);
    });
});

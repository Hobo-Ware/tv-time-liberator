import { beforeEach, describe, expect, it } from 'bun:test';
import { MemoryDB } from './MemoryDB';

describe('MemoryDB', () => {
    let db: MemoryDB;

    beforeEach(() => {
        db = new MemoryDB();
    });

    it('should set and get a value', async () => {
        await db.set('key', 'value');
        expect(await db.get<string>('key')).toBe('value');
    });

    it('should return undefined if key does not exist', async () => {
        expect(await db.get<string>('key')).toBeUndefined();
    });

    it('should return nested values', async () => {
        await db.set('nested.key', 'value');
        expect(await db.get<string>('nested.key')).toBe('value');
    });

    it('should return undefined if nested key does not exist', async () => {
        expect(await db.get<string>('nested.key')).toBeUndefined();
    });

    it('should return true if key exists', async () => {
        await db.set('key', 'value');
        expect(await db.has('key')).toBe(true);
    });

    it('should return false if key does not exist', async () => {
        expect(await db.has('key')).toBe(false);
    });

    it('should return true if nested key exists', async () => {
        await db.set('nested.key', 'value');
        expect(await db.has('nested.key')).toBe(true);
    });

    it('should return false if nested key does not exist', async () => {
        expect(await db.has('nested.key')).toBe(false);
    });

    it('should delete a key', async () => {
        await db.set('key', 'value');
        await db.delete('key');
        expect(await db.has('key')).toBe(false);
    });

    it('should delete a nested key', async () => {
        await db.set('nested.key', 'value');
        await db.delete('nested.key');
        expect(await db.has('nested.key')).toBe(false);
    });

    it('should delete all keys', async () => {
        await db.set('key', 'value');
        await db.set('nested.key', 'value');
        await db.deleteAll();
        expect(await db.has('key')).toBe(false);
        expect(await db.has('nested.key')).toBe(false);
    });

    it('should delete all children of a key', async () => {
        await db.set('nested.key', 'value');
        await db.set('nested.other', 'value');
        await db.delete('nested');
        expect(await db.has('nested.key')).toBe(false);
        expect(await db.has('nested.other')).toBe(false);
    });
});
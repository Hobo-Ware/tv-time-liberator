import { mock } from 'bun:test';

class FSDBMock {
    private memory = new Map();

    async get(key: string) {
        return this.memory.get(key);
    }

    async set(key: string, value: any) {
        this.memory.set(key, value);
    }

    async has(key: string) {
        return this.memory.has(key);
    }

    async delete(key: string) {
        this.memory.delete(key);
    }
}

mock.module('file-system-db', () => {

    console.log('--- Mocking file-system-db ---');

    return {
        FSDB: FSDBMock,
    };
});
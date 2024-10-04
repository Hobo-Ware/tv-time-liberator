import { mock } from 'bun:test';
import { MemoryDB } from '../src/cli/store/MemoryDB';

mock.module('file-system-db', () => {
    console.log('--- Mocking file-system-db ---');

    return {
        FSDB: function () { return new MemoryDB({}) },
    };
});
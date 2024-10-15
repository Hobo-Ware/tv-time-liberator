import './db.mock';
import './env.mock';

import { beforeAll, expect } from 'bun:test';
import { login } from '../src/cli/login';
import { assertDefined } from '../src/core/utils/assertDefined';
import { PersistentStore } from '../src/cli/store';
import { setCache } from '../src/core/http';

beforeAll(async () => {
    console.log('--- Authorizing test user before all tests ---');

    const username = assertDefined(import.meta.env.TV_TIME_TEST_USERNAME, 'TV_TIME_TEST_USERNAME not defined.');
    const password = assertDefined(import.meta.env.TV_TIME_TEST_PASSWORD, 'TV_TIME_TEST_PASSWORD not defined.');

    const { token, userId } = await login(username, password);

    expect(token).toBeDefined();
    expect(userId).toBeDefined();

    /**
     * The db.mock.ts file is used to mock the file-system-db library
     * The PersistentStore will now use the in-memory store instead of the file-system-db
     */
    setCache(await PersistentStore.create(''));

    console.log('--- Initiating testing ---');
});

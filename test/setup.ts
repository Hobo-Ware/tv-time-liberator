import './db.mock';

import { beforeAll, expect } from 'bun:test';
import { login } from '../src/cli/login';
import { assertDefined } from '../src/core/utils/assertDefined';

beforeAll(async () => {
    console.log('--- Authorizing test user before all tests ---');

    const username = assertDefined(process.env.TV_TIME_TEST_USERNAME, 'TV_TIME_TEST_USERNAME not defined.');
    const password = assertDefined(process.env.TV_TIME_TEST_PASSWORD, 'TV_TIME_TEST_PASSWORD not defined.');

    const { token, userId } = await login(username, password);

    expect(token).toBeDefined();
    expect(userId).toBeDefined();
    
    console.log('--- Initiating testing ---');
})
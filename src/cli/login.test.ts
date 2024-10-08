import { describe, expect, it } from 'bun:test';

import { login } from './login';
import { assertDefined } from '../core/utils/assertDefined';

describe('login', () => {
    it('should fetch token', async () => {
        const username = assertDefined(import.meta.env.TV_TIME_TEST_USERNAME, 'TV_TIME_TEST_USERNAME not defined.');
        const password = assertDefined(import.meta.env.TV_TIME_TEST_PASSWORD, 'TV_TIME_TEST_PASSWORD not defined.');

        const token = await login(username, password);

        expect(token).toBeDefined();
    });
});
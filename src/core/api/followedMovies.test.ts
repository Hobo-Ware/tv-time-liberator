import { describe, it, expect } from 'bun:test';
import { login } from '../../cli/login';
import { assertDefined } from '../utils/assertDefined';
import { setAuthorizationHeader } from '../http/setAuthorizationHeader';
import { followedMovies } from './followedMovies';
import { mr_nobody_watched, the_matrix_not_watched } from '../../.test/data';

describe.only('followedMovies', () => {
    it('should fetch followed movies', async () => {
        const username = assertDefined(process.env.TV_TIME_TEST_USERNAME, 'TV_TIME_TEST_USERNAME not defined.');
        const password = assertDefined(process.env.TV_TIME_TEST_PASSWORD, 'TV_TIME_TEST_PASSWORD not defined.');

        const { token, userId } = await login(username, password);

        setAuthorizationHeader(token);

        const movies = await followedMovies({ userId });

        expect(movies).toBeArray();
        expect(movies).toBeArrayOfSize(2);
        expect(movies).toContainValue(mr_nobody_watched);
        expect(movies).toContainValue(the_matrix_not_watched);
    });
});
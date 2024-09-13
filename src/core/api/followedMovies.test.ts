import { describe, it, expect } from 'bun:test';
import { login } from '../../cli/login';
import { assertDefined } from '../utils/assertDefined';
import { setAuthorizationHeader } from '../http/setAuthorizationHeader';
import { followedMovies } from './followedMovies';

const mr_nobody_watched = {
    id: {
        tvdb: 1571,
        imdb: "-1",
    },
    created_at: "2024-09-13T10:49:37Z",
    uuid: "409c29e8-8daf-41bd-843a-8a217320d374",
    title: "Mr. Nobody",
    watched_at: "2024-09-13T10:49:37Z",
    is_watched: true,
};

const the_matrix_not_watched = {
    id: {
        tvdb: 169,
        imdb: "-1",
    },
    created_at: "2024-09-13T10:49:58Z",
    uuid: "978899c4-5194-4568-b922-0bd2874c4c1a",
    title: "The Matrix",
    watched_at: undefined,
    is_watched: false,
}

describe.only('followedMovies', () => {
    it('should fetch followed movies', async () => {
        const username = assertDefined(process.env.TV_TIME_TEST_USERNAME, 'TV_TIME_TEST_USERNAME not defined.');
        const password = assertDefined(process.env.TV_TIME_TEST_PASSWORD, 'TV_TIME_TEST_PASSWORD not defined.');

        const { token, userId } = await login(username, password);

        setAuthorizationHeader(token);

        const movies = await followedMovies(userId);

        expect(movies).toBeArray();
        expect(movies).toBeArrayOfSize(2);
        expect(movies).toContainValue(mr_nobody_watched);
        expect(movies).toContainValue(the_matrix_not_watched);
    });
});
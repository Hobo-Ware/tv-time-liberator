import { describe, it, expect } from 'bun:test';
import { myLists } from './myLists';
import { assertDefined } from '../utils/assertDefined';
import { login } from '../../cli/login';
import { setAuthorizationHeader } from '../http/setAuthorizationHeader';
import { alien_unwatched, chernobyl_up_to_date, mr_nobody_watched, the_triangle_unwatched } from '../../.test/data';

describe('myLists', () => {
    it('should return my lists', async () => {
        const username = assertDefined(import.meta.env.TV_TIME_TEST_USERNAME, 'TV_TIME_TEST_USERNAME not defined.');
        const password = assertDefined(import.meta.env.TV_TIME_TEST_PASSWORD, 'TV_TIME_TEST_PASSWORD not defined.');

        const { token, userId } = await login(username, password);

        setAuthorizationHeader(token);

        const lists = await myLists({ userId });
        expect(lists).toBeArrayOfSize(2);

        const [watched, unwatched] = lists;

        expect(watched.name).toBe('My Super List');
        expect(watched.description).toBe('Everything I ever wanted.');
        expect(watched.is_public).toBeTrue();
        expect(watched.movies).toBeArrayOfSize(1);
        expect(watched.shows).toBeArrayOfSize(1);

        const mr_nobody = watched.movies.find(item => item.uuid === mr_nobody_watched.uuid);
        expect(mr_nobody).toBeDefined();
        expect(mr_nobody).toMatchObject({
            title: mr_nobody_watched.title,
            id: mr_nobody_watched.id,
        });

        const chernobyl = watched.shows.find(item => item.uuid === chernobyl_up_to_date.uuid);
        expect(chernobyl).toBeDefined();
        expect(chernobyl).toMatchObject({
            id: chernobyl_up_to_date.id,
            seasons: chernobyl_up_to_date.seasons,
        });

        expect(unwatched.name).toBe('Unwatched List');
        expect(unwatched.description).toBe('List of things I never watched!');

        expect(unwatched.movies).toBeArrayOfSize(1);
        expect(unwatched.shows).toBeArrayOfSize(1);

        const alien = unwatched.movies.find(item => item.uuid === alien_unwatched.uuid);
        expect(alien).toBeDefined();
        expect(alien).toMatchObject({
            title: alien_unwatched.title,
            id: alien_unwatched.id,
        });

        const the_triangle = unwatched.shows.find(item => item.uuid === the_triangle_unwatched.uuid);
        expect(the_triangle).toBeDefined();
        expect(the_triangle).toMatchObject({
            id: the_triangle_unwatched.id,
            seasons: the_triangle_unwatched.seasons,
        });
    });
});
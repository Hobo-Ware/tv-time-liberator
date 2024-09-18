import { describe, it, expect } from 'bun:test';
import { myLists } from './myLists';
import { assertDefined } from '../utils/assertDefined';
import { login } from '../../cli/login';
import { setAuthorizationHeader } from '../http/setAuthorizationHeader';
import { chernobyl_up_to_date, mr_nobody_watched } from '../../.test/data';

describe('myLists', () => {
    it('should return my lists', async () => {
        const username = assertDefined(process.env.TV_TIME_TEST_USERNAME, 'TV_TIME_TEST_USERNAME not defined.');
        const password = assertDefined(process.env.TV_TIME_TEST_PASSWORD, 'TV_TIME_TEST_PASSWORD not defined.');

        const { token, userId } = await login(username, password);

        setAuthorizationHeader(token);

        const lists = await myLists(userId);
        expect(lists).toBeArrayOfSize(1);

        const [list] = lists;

        expect(list.name).toBe('My Super List');
        expect(list.description).toBe('Everything I ever wanted.');
        expect(list.is_public).toBeTrue();
        expect(list.items).toBeArrayOfSize(2);

        const mr_nobody = list.items.find(item => item.uuid === mr_nobody_watched.uuid);
        expect(mr_nobody).toBeDefined();
        expect(mr_nobody).toMatchObject({
            title: mr_nobody_watched.title,
            type: 'movie',
        });

        const chernobyl = list.items.find(item => item.uuid === chernobyl_up_to_date.uuid);
        expect(chernobyl).toBeDefined();
        expect(chernobyl).toMatchObject({
            title: chernobyl_up_to_date.title,
            type: 'series',
        });
    });
});
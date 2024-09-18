import { describe, it, expect } from 'bun:test';
import { login } from '../../cli/login';
import { setAuthorizationHeader } from '../http/setAuthorizationHeader';
import { assertDefined } from '../utils/assertDefined';
import { favoriteList } from './favoriteList';
import { chernobyl_up_to_date, mr_nobody_watched } from '../../.test/data';

describe('favoriteList', () => {
    it('should fetch favorite list', async () => {
        const username = assertDefined(process.env.TV_TIME_TEST_USERNAME, 'TV_TIME_TEST_USERNAME not defined.');
        const password = assertDefined(process.env.TV_TIME_TEST_PASSWORD, 'TV_TIME_TEST_PASSWORD not defined.');

        const { token, userId } = await login(username, password);

        setAuthorizationHeader(token);

        const favorites = await favoriteList(userId);

        expect(favorites).toBeArrayOfSize(2);

        const mr_nobody = favorites.find(favorite => favorite.uuid === mr_nobody_watched.uuid);
        expect(mr_nobody).toBeDefined();

        const chernobyl = favorites.find(favorite => favorite.uuid === chernobyl_up_to_date.uuid);
        expect(chernobyl).toBeDefined();
    });
});
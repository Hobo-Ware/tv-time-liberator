import { describe, it, expect } from 'bun:test';
import { login } from '../../cli/login';
import { setAuthorizationHeader } from '../http/setAuthorizationHeader';
import { assertDefined } from '../utils/assertDefined';
import { favoriteList } from './favoriteList';
import { chernobyl_up_to_date, mr_nobody_watched } from '../../.test/data';

describe('favoriteList', () => {
    it('should fetch favorite list', async () => {
        const username = assertDefined(import.meta.env.TV_TIME_TEST_USERNAME, 'TV_TIME_TEST_USERNAME not defined.');
        const password = assertDefined(import.meta.env.TV_TIME_TEST_PASSWORD, 'TV_TIME_TEST_PASSWORD not defined.');

        const { token, userId } = await login(username, password);

        setAuthorizationHeader(token);

        const favorites = await favoriteList({ userId });

        expect(favorites.shows).toBeArrayOfSize(1);
        expect(favorites.movies).toBeArrayOfSize(1);

        const mr_nobody = favorites.movies.find(favorite => favorite.uuid === mr_nobody_watched.uuid);
        expect(mr_nobody).toBeDefined();
        expect(mr_nobody).toMatchObject({
            title: mr_nobody_watched.title,
            id: mr_nobody_watched.id,
        });

        const chernobyl = favorites.shows.find(favorite => favorite.uuid === chernobyl_up_to_date.uuid);
        expect(chernobyl).toBeDefined();
        expect(chernobyl).toMatchObject({
            id: chernobyl_up_to_date.id,
            seasons: chernobyl_up_to_date.seasons,
        });
    });
});
import { describe, it, expect } from 'bun:test';
import { login } from '../../cli/login';
import { assertDefined } from '../utils/assertDefined';
import { setAuthorizationHeader } from '../http/setAuthorizationHeader';
import { followedShows } from './followedShows';
import { chernobyl_up_to_date, house_usher_continuing, station_eleven_stopped } from '../../.test/data';

describe('followedShows', () => {
    it('should fetch followed shows', async () => {
        const username = assertDefined(import.meta.env.TV_TIME_TEST_USERNAME, 'TV_TIME_TEST_USERNAME not defined.');
        const password = assertDefined(import.meta.env.TV_TIME_TEST_PASSWORD, 'TV_TIME_TEST_PASSWORD not defined.');

        const { token, userId } = await login(username, password);

        setAuthorizationHeader(token);

        const shows = await followedShows({ userId });

        expect(shows).toBeArray();
        expect(shows).toBeArrayOfSize(3);

        expect(shows).toContainValue(station_eleven_stopped);
        expect(shows).toContainValue(chernobyl_up_to_date);
        expect(shows).toContainValue(house_usher_continuing);
    });
});
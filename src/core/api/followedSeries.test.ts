import { describe, it, expect } from 'bun:test';
import { login } from '../../cli/login';
import { assertDefined } from '../utils/assertDefined';
import { setAuthorizationHeader } from '../http/setAuthorizationHeader';
import { followedSeries } from './followedSeries';

const station_eleven = {
    "uuid": "c4199ff4-2055-4dc9-ab33-ecf7ffcec6e3",
    "id": {
        "tvdb": 366529,
        "imdb": "-1"
    },
    "created_at": "2024-09-13T10:50:24.320066Z",
    "title": "Station Eleven",
    "status": "stopped",
    "seasons": [
        {
            "number": 1,
            "episodes": [
                {
                    "number": 1,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:29"
                },
                {
                    "number": 2,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:29"
                },
                {
                    "number": 3,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:30"
                },
                {
                    "number": 4,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:30"
                },
                {
                    "number": 5,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "number": 6,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "number": 7,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "number": 8,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "number": 9,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "number": 10,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                }
            ]
        }
    ]
};

const chernobyl = {
    "uuid": "7bbcdd21-d0a3-40fe-b5f1-480f6648e983",
    "id": {
        "tvdb": 360893,
        "imdb": "-1"
    },
    "created_at": "2024-09-13T10:49:37.535433Z",
    "title": "Chernobyl",
    "status": "up_to_date",
    "seasons": [
        {
            "number": 1,
            "episodes": [
                {
                    "number": 1,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:40"
                },
                {
                    "number": 2,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:49"
                },
                {
                    "number": 3,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:49"
                },
                {
                    "number": 4,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:49"
                },
                {
                    "number": 5,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:49"
                }
            ]
        }
    ]
};

const house_usher = {
    "uuid": "1a13c391-9a68-4d71-b947-ade779e39b64",
    "id": {
        "tvdb": 411021,
        "imdb": "-1"
    },
    "created_at": "2024-09-13T10:49:37.535425Z",
    "title": "The Fall of the House of Usher",
    "status": "continuing",
    "seasons": [
        {
            "number": 1,
            "episodes": [
                {
                    "number": 1,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:57"
                },
                {
                    "number": 2,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:58"
                },
                {
                    "number": 3,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:58"
                },
                {
                    "number": 4,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "number": 5,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "number": 6,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "number": 7,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "number": 8,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                }
            ]
        }
    ]
};

describe.only('followedSeries', () => {
    it('should fetch followed movies', async () => {
        const username = assertDefined(process.env.TV_TIME_TEST_USERNAME, 'TV_TIME_TEST_USERNAME not defined.');
        const password = assertDefined(process.env.TV_TIME_TEST_PASSWORD, 'TV_TIME_TEST_PASSWORD not defined.');

        const { token, userId } = await login(username, password);

        setAuthorizationHeader(token);

        const shows = await followedSeries(userId);

        expect(shows).toBeArray();
        expect(shows).toBeArrayOfSize(3);

        expect(shows).toContainValue(station_eleven);
        expect(shows).toContainValue(chernobyl);
        expect(shows).toContainValue(house_usher);
    });
});
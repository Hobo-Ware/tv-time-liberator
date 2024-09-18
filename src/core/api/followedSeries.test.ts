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
                    "id": {
                        "tvdb": 8815687,
                        "imdb": "-1"
                    },
                    "number": 1,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:29"
                },
                {
                    "id": {
                        "tvdb": 8884141,
                        "imdb": "-1"
                    },
                    "number": 2,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:29"
                },
                {
                    "id": {
                        "tvdb": 8884142,
                        "imdb": "-1"
                    },
                    "number": 3,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:30"
                },
                {
                    "id": {
                        "tvdb": 8884143,
                        "imdb": "-1"
                    },
                    "number": 4,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:30"
                },
                {
                    "id": {
                        "tvdb": 8884144,
                        "imdb": "-1"
                    },
                    "number": 5,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "id": {
                        "tvdb": 8884152,
                        "imdb": "-1"
                    },
                    "number": 6,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "id": {
                        "tvdb": 8884153,
                        "imdb": "-1"
                    },
                    "number": 7,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "id": {
                        "tvdb": 8884147,
                        "imdb": "-1"
                    },
                    "number": 8,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "id": {
                        "tvdb": 8885854,
                        "imdb": "-1"
                    },
                    "number": 9,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "id": {
                        "tvdb": 8885855,
                        "imdb": "-1"
                    },
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
                    "id": {
                        "tvdb": 8759048,
                        "imdb": "-1"
                    },
                    "number": 1,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:57"
                },
                {
                    "id": {
                        "tvdb": 9948522,
                        "imdb": "-1"
                    },
                    "number": 2,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:58"
                },
                {
                    "id": {
                        "tvdb": 9948523,
                        "imdb": "-1"
                    },
                    "number": 3,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:58"
                },
                {
                    "id": {
                        "tvdb": 9948524,
                        "imdb": "-1"
                    },
                    "number": 4,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "id": {
                        "tvdb": 9948525,
                        "imdb": "-1"
                    },
                    "number": 5,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "id": {
                        "tvdb": 9948526,
                        "imdb": "-1"
                    },
                    "number": 6,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "id": {
                        "tvdb": 9948527,
                        "imdb": "-1"
                    },
                    "number": 7,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                },
                {
                    "id": {
                        "tvdb": 9948528,
                        "imdb": "-1"
                    },
                    "number": 8,
                    "special": false,
                    "is_watched": false,
                    "watched_at": null
                }
            ]
        }
    ]
};

const house_usher = {
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
                    "id": {
                        "tvdb": 7082952,
                        "imdb": "-1"
                    },
                    "number": 1,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:40"
                },
                {
                    "id": {
                        "tvdb": 7109113,
                        "imdb": "-1"
                    },
                    "number": 2,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:49"
                },
                {
                    "id": {
                        "tvdb": 7223774,
                        "imdb": "-1"
                    },
                    "number": 3,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:49"
                },
                {
                    "id": {
                        "tvdb": 7116984,
                        "imdb": "-1"
                    },
                    "number": 4,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:49"
                },
                {
                    "id": {
                        "tvdb": 7116987,
                        "imdb": "-1"
                    },
                    "number": 5,
                    "special": false,
                    "is_watched": true,
                    "watched_at": "2024-09-13 10:50:49"
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
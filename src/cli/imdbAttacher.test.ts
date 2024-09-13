import { describe, expect, it, afterEach } from 'bun:test';
import { Movie } from '../core/types/Movie';
import { imdbAttacher } from './imdbAttacher';

describe('imdbAttacher', () => {
    it('should attach imdb data to a movie', async () => {
        const movie: Movie = {
            id: {
                tvdb: 340197,
                imdb: '-1'
            },
            created_at: "2024-08-06T22:12:35Z",
            uuid: "1828cbda-edee-4a09-af91-706a3fc6d2fd",
            title: "Despicable Me 4",
            watched_at: "2024-08-22T19:01:55Z",
            is_watched: true
        };

        const [result] = await imdbAttacher([movie], 'movie');

        expect(result.id.imdb).toEqual("tt7510222");
    });

    it('should attach imdb data to a list of movies', async () => {
        const expected = {
            "340197": "tt7510222",
            "343545": "tt13539646",
            "90": "tt7605074",
            "11716": "tt6791350",
            "339791": "tt12121582",
            "331904": "tt16428256",
            "343593": "tt16419074",
            "332800": "tt6160448"
        };

        const movies: Movie[] = [
            {
                id: {
                    tvdb: 343545,
                    imdb: "-1"
                },
                created_at: "2023-05-23T07:52:06Z",
                uuid: "c170f085-1283-4388-9fe1-8e1354a34b3d",
                title: "The Wandering Earth 2",
                watched_at: "2023-06-13T06:27:29Z",
                is_watched: true
            },
            {
                id: {
                    tvdb: 90,
                    imdb: "-1"
                },
                created_at: "2023-05-23T07:52:03Z",
                uuid: "63d66d1d-61db-4e98-8301-08f24391d0e2",
                title: "The Wandering Earth",
                watched_at: "2023-05-23T07:52:08Z",
                is_watched: true
            },
            {
                id: {
                    tvdb: 11716,
                    imdb: "-1"
                },
                created_at: "2019-12-27T00:55:57Z",
                uuid: "40b1a8ca-b35c-451f-9dfd-2c4186bae401",
                title: "Guardians of the Galaxy Vol. 3",
                watched_at: "2023-05-19T19:43:46Z",
                is_watched: true
            },
            {
                id: {
                    tvdb: 339791,
                    imdb: "-1"
                },
                created_at: "2023-03-30T13:55:18Z",
                uuid: "7941bf9f-7ee7-4d83-b64d-fc8f49201bd6",
                title: "When You Finish Saving the World",
                watched_at: "2023-05-08T17:56:23Z",
                is_watched: true
            },
            {
                id: {
                    tvdb: 331904,
                    imdb: "-1"
                },
                created_at: "2023-04-23T13:34:36Z",
                uuid: "e3d5db7d-2462-42e7-8449-535d707db8ee",
                title: "Suzume",
                watched_at: "2023-04-23T21:37:50Z",
                is_watched: true
            },
            {
                id: {
                    tvdb: 343593,
                    imdb: "-1"
                },
                created_at: "2023-04-19T22:29:47Z",
                uuid: "3d076228-8b17-43cd-9b7f-31208843f139",
                title: "Air",
                watched_at: "2023-04-19T22:29:47Z",
                is_watched: true
            },
            {
                id: {
                    tvdb: 332800,
                    imdb: "-1"
                },
                created_at: "2023-01-03T21:58:11Z",
                uuid: "eeece49c-365b-429e-bd8c-898bd99eeca4",
                title: "White Noise",
                watched_at: "2023-04-16T19:09:10Z",
                is_watched: true
            },
        ];

        const result = await imdbAttacher(movies, 'movie');

        result.forEach((movie) => {
            expect(movie.id.imdb).toEqual(expected[movie.id.tvdb.toString()]);
        });
    });
});
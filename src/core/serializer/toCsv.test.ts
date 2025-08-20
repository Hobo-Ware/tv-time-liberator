import { describe, expect, it } from "bun:test";
import {
    chernobyl_up_to_date,
    house_usher_continuing,
    mr_nobody_watched,
    the_matrix_not_watched,
} from "../../.test/data";
import { toCsv } from "./toCsv";

describe("toCsv", () => {
    it("should serialize movies", () => {
        const result = toCsv({
            movies: [mr_nobody_watched, the_matrix_not_watched] as any,
            shows: [],
        });

        expect(result).toBeString();
        const [header, nobody, matrix] = result.split("\n");

        expect(header).toBe(
            "imdb_id,tvdb_id,type,title,season,episode,is_special,is_watched,watched_at,rewatch_count,status,is_watchlisted\r",
        );
        expect(nobody).toBe(
            `${mr_nobody_watched.id?.imdb},${mr_nobody_watched.id?.tvdb},movie,${mr_nobody_watched.title},,,false,${mr_nobody_watched.is_watched},${mr_nobody_watched.watched_at},${mr_nobody_watched.rewatch_count},,false\r`,
        );
        expect(matrix).toBe(
            `${the_matrix_not_watched.id?.imdb},${the_matrix_not_watched.id?.tvdb},movie,${the_matrix_not_watched.title},,,false,${the_matrix_not_watched.is_watched},,,,true\r`,
        );
    });

    it("should serialize shows", () => {
        const shows = [chernobyl_up_to_date, house_usher_continuing];

        const result = toCsv({
            movies: [],
            shows: shows as any,
        });

        expect(result).toBeString();
        const [header, ...rest] = result.split("\n");
        expect(header).toBe(
            "imdb_id,tvdb_id,type,title,season,episode,is_special,is_watched,watched_at,rewatch_count,status,is_watchlisted\r",
        );

        chernobyl_up_to_date.seasons
            .forEach(({ number: season, episodes }) => {
                episodes
                    .forEach(
                        (
                            {
                                id,
                                special,
                                number: episode,
                                is_watched,
                                watched_at,
                            },
                        ) => {
                            if (!is_watched) {
                                return;
                            }
                            const row = rest.shift();
                            expect(row).toBe(
                                `${id?.imdb},${id?.tvdb},episode,${chernobyl_up_to_date.title},${season},${episode},${special},${is_watched},${watched_at},,${chernobyl_up_to_date.status},false\r`,
                            );
                        },
                    );
            });

        house_usher_continuing.seasons
            .forEach(({ number: season, episodes }) => {
                episodes
                    .forEach(
                        (
                            {
                                id,
                                special,
                                number: episode,
                                is_watched,
                                watched_at,
                            },
                        ) => {
                            if (!is_watched) {
                                return;
                            }
                            const row = rest.shift();
                            expect(row).toBe(
                                `${id?.imdb},${id?.tvdb},episode,${house_usher_continuing.title},${season},${episode},${special},${is_watched},${
                                    watched_at ?? ""
                                },,${house_usher_continuing.status},${watched_at == null}\r`,
                            );
                        },
                    );
            });

        shows.forEach(({
            id,
            title,
            status,
            seasons,
        }) => {
            const hasUnwatchedEpisode = seasons?.some(
                ({ episodes }) => episodes.some(episode => !episode.is_watched)
            );

            const row = rest.shift();
            expect(row).toBe(
                `${id?.imdb},${id?.tvdb},show,${title},,,,,,,${status},${hasUnwatchedEpisode}\r`,
            );
        })
    });
});

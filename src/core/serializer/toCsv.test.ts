import { describe, expect, it } from "bun:test";
import { toCsv } from "./toCsv";
import {
    chernobyl_up_to_date,
    house_usher_continuing,
    mr_nobody_watched,
    the_matrix_not_watched,
} from "../../.test/data";

describe("toCsv", () => {
    it("should serialize movies", () => {
        const result = toCsv({
            movies: [mr_nobody_watched, the_matrix_not_watched] as any,
            shows: [],
        });

        expect(result).toBeString();
        const [header, nobody, matrix] = result.split("\n");

        expect(header).toBe(
            "imdb_id,tvdb_id,type,title,season,episode,is_special,is_watched,watched_at,status,is_watchlisted\r",
        );
        expect(nobody).toBe(
            `${mr_nobody_watched.id?.imdb},${mr_nobody_watched.id?.tvdb},movie,${mr_nobody_watched.title},,,false,${mr_nobody_watched.is_watched},${mr_nobody_watched.watched_at},,false\r`,
        );
        expect(matrix).toBe(
            `${the_matrix_not_watched.id?.imdb},${the_matrix_not_watched.id?.tvdb},movie,${the_matrix_not_watched.title},,,false,${the_matrix_not_watched.is_watched},,,true\r`,
        );
    });

    it.only("should serialize shows", () => {
        const result = toCsv({
            movies: [],
            shows: [chernobyl_up_to_date, house_usher_continuing] as any,
        });

        expect(result).toBeString();
        const [header, ...rest] = result.split("\n");
        expect(header).toBe(
            "imdb_id,tvdb_id,type,title,season,episode,is_special,is_watched,watched_at,status,is_watchlisted\r",
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
                            const row = rest.shift();
                            expect(row).toBe(
                                `${id?.imdb},${id?.tvdb},show,${chernobyl_up_to_date.title},${season},${episode},${special},${is_watched},${watched_at},${chernobyl_up_to_date.status},false\r`,
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
                            const row = rest.shift();
                            expect(row).toBe(
                                `${id?.imdb},${id?.tvdb},show,${house_usher_continuing.title},${season},${episode},${special},${is_watched},${
                                    watched_at ?? ""
                                },${house_usher_continuing.status},${watched_at == null}\r`,
                            );
                        },
                    );
            });
    });
});

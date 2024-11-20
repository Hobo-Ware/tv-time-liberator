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
        console.log(header);
        expect(header).toBe(
            "id_imdb,id_tvdb,type,title,season,episode,is_special,is_watched,watched_at,status\r",
        );
        expect(nobody).toBe(
            `${mr_nobody_watched.id?.imdb},${mr_nobody_watched.id?.tvdb},movie,${mr_nobody_watched.title},,,false,${mr_nobody_watched.is_watched},${mr_nobody_watched.watched_at},\r`,
        );
        expect(matrix).toBe(
            `${the_matrix_not_watched.id?.imdb},${the_matrix_not_watched.id?.tvdb},movie,${the_matrix_not_watched.title},,,false,${the_matrix_not_watched.is_watched},,\r`,
        );
    });

    it("should serialize shows", () => {
        const result = toCsv({
            movies: [],
            shows: [chernobyl_up_to_date, house_usher_continuing] as any,
        });

        expect(result).toBeString();
        const [header, ...rest] = result.split("\n");
        expect(header).toBe(
            "id_imdb,id_tvdb,type,title,season,episode,is_special,is_watched,watched_at,status\r",
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
                                `${id?.imdb},${id?.tvdb},show,${chernobyl_up_to_date.title},${season},${episode},${special},${is_watched},${watched_at},${chernobyl_up_to_date.status}\r`,
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
                                },${house_usher_continuing.status}\r`,
                            );
                        },
                    );
            });
    });
});

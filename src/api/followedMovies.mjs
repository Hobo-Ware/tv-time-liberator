import * as db from './internal/db.mjs';
import { URL } from './internal/url.mjs';
import { get } from './internal/get.mjs';

/**
 * Retrieves a list of followed movies.
 * @returns {Array} An array of movie objects.
 */
export async function followedMovies() {
    const { userId } = await db.get(db.TvTimeValue.UserToken);

    const url = URL.Get.Follows.Movies(userId);

    return get(url)
        .then(response => response.data.objects);
}
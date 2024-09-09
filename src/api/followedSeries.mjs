import * as db from './internal/db.mjs';
import { URL } from './internal/url.mjs';
import { get } from './internal/get.mjs';

/**
 * Retrieves a list of followed series.
 * @returns {Array} An array of series objects.
 */
export async function followedSeries() {
    const { userId } = await db.get(db.TvTimeValue.UserToken);

    const url = URL.Get.Follows.Series(userId);

    return get(url)
        .then(response => response.data.objects);
}
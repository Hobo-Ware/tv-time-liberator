import { get } from './internal/get.mjs';
import { URL } from './internal/url.mjs';

export async function infoSeries(id) {
    const url = URL.Get.Series.Info(id);
    

    return await get(url);
}
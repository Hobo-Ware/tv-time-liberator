import { get } from '../http/get';
import { Resource } from '../http/Resource';

export async function infoSeries(id): Promise<any> {
    const url = Resource.Get.Series.Info(id);

    return await get(url);
}
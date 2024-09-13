import browser from 'webextension-polyfill';
import { currentTab } from '../currentTab';
import { Topic } from '../topic/Topic';
import type { TopicPayloadMap } from '../topic/TopicPayloadMap';
import type { TopicResponseMap } from '../topic/TopicResponseMap';

export async function emitOnCurrentTab<T extends Topic>(topic: T, payload: TopicPayloadMap[T]): Promise<TopicResponseMap[T]> {
    const tab = await currentTab();

    return browser.tabs.sendMessage(tab.id!, {
        topic,
        payload,
    });
}

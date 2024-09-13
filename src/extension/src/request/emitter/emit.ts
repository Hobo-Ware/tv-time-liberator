import browser from 'webextension-polyfill';

import { Topic } from '../topic/Topic';
import type { TopicPayloadMap } from '../topic/TopicPayloadMap';
import type { TopicResponseMap } from '../topic/TopicResponseMap';

export function emit<T extends Topic>(topic: T, payload: TopicPayloadMap[T]): Promise<TopicResponseMap[T]> {
    return browser.runtime.sendMessage({
        topic,
        payload,
    });
}
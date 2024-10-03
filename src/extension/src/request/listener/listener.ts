import browser from 'webextension-polyfill';
import { Topic } from '../topic/Topic';
import type { TopicPayloadMap } from '../topic/TopicPayloadMap';
import type { TopicResponseMap } from '../topic/TopicResponseMap';

export function listener<T extends Topic>(
    topic: T,
    resolver: (payload: TopicPayloadMap[T]) => Promise<TopicResponseMap[T]> | TopicResponseMap[T]
): void {
    browser
        .runtime
        .onMessage
        .addListener((message, _, reply) => {
            const { topic: messageTopic, payload } = message as { topic: T, payload: TopicPayloadMap[T] };

            if (messageTopic === topic) {
                Promise
                    .resolve()
                    .then(() => resolver(payload))
                    .then(reply);
            }

            return true;
        })
}

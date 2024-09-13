import { Topic } from '../topic/Topic';

export type TopicPayloadMap = {
    [Topic.Export]: void;
    [Topic.CheckAuthorization]: void;
    [Topic.IMDB]: {
        type: 'movie' | 'series';
        id: number;
    };
}
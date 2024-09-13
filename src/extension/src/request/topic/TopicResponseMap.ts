import type { IMDBReference } from '../models/IMDBReference';
import { Topic } from '../topic/Topic';

export type TopicResponseMap = {
    [Topic.Export]: void;
    [Topic.CheckAuthorization]: boolean;
    [Topic.IMDB]: IMDBReference;
}
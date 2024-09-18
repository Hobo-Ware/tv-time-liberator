import type { DereferrerOptions } from '../../../../core/api';
import { Topic } from '../topic/Topic';

export type TopicPayloadMap = {
    [Topic.Export]: void;
    [Topic.CheckAuthorization]: void;
    [Topic.IMDB]: DereferrerOptions;
}
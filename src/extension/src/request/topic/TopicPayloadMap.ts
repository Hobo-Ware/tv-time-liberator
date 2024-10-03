import type { DereferrerOptions } from '../../../../core/api';
import type { ProgressReport } from '../../../../core/utils/ProgressReporter';
import type { Topic } from '../topic/Topic';

export type TopicPayloadMap = {
    [Topic.Export]: void;
    [Topic.CheckAuthorization]: void;
    [Topic.IMDB]: DereferrerOptions;
    [Topic.Progress]: ProgressReport;
    [Topic.CurrentProgress]: void;
}
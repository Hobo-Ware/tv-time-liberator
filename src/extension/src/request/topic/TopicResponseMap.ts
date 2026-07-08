import type { IMDBReference } from '../../../../core/types/IMDBReference';
import type { ProgressReport } from '../../../../core/utils/ProgressReporter';
import { Topic } from '../topic/Topic';

export type TopicResponseMap = {
    [Topic.Export]: void;
    [Topic.CheckAuthorization]: boolean;
    [Topic.IMDB]: IMDBReference;
    [Topic.Progress]: void;
    [Topic.CurrentProgress]: ProgressReport;
}
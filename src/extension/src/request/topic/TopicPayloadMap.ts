import type { DereferrerOptions } from '../../../../core/api';
import type { ProgressReport } from '../../../../core/utils/ProgressReporter';
import type { Topic } from '../topic/Topic';

export type ExportFormat = 'zip' | 'files';

export type TopicPayloadMap = {
    [Topic.Export]: { format: ExportFormat };
    [Topic.CheckAuthorization]: void;
    [Topic.IMDB]: DereferrerOptions;
    [Topic.Progress]: ProgressReport;
    [Topic.CurrentProgress]: void;
}
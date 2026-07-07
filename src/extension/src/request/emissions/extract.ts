import { emitOnCurrentTab } from '../emitter/emitOnCurrentTab';
import { Topic } from '../topic/Topic';
import type { ExportFormat } from '../topic/TopicPayloadMap';

export async function extract(format: ExportFormat = 'zip', includeEpisodeRatings = false) {
    return emitOnCurrentTab(Topic.Export, { format, includeEpisodeRatings });
}
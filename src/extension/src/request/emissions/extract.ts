import { emitOnCurrentTab } from '../emitter/emitOnCurrentTab';
import { Topic } from '../topic/Topic';
import type { ExportFormat } from '../topic/TopicPayloadMap';

export async function extract(format: ExportFormat = 'zip') {
    return emitOnCurrentTab(Topic.Export, { format });
}
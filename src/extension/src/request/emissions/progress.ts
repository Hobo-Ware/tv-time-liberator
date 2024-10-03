import type { ProgressReport } from '../../../../core/utils/ProgressReporter';
import { emit } from '../emitter/emit';
import { Topic } from '../topic/Topic';

export function emitProgress(payload: ProgressReport) {
    return emit(Topic.Progress, payload);
}
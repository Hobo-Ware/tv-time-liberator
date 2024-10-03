import { emitOnCurrentTab } from '../emitter/emitOnCurrentTab';
import { Topic } from '../topic/Topic';

export function currentProgress() {
    return emitOnCurrentTab(Topic.CurrentProgress, void 0);
}
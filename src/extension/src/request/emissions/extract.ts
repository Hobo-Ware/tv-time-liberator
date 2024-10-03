import { emitOnCurrentTab } from '../emitter/emitOnCurrentTab';
import { Topic } from '../topic/Topic';

export async function extract() {
    return emitOnCurrentTab(Topic.Export, void 0);
}
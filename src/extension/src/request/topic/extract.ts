import { emitOnCurrentTab } from '../emitter/emitOnCurrentTab';
import { Topic } from './Topic';

export async function extract() {
    return emitOnCurrentTab(Topic.Export, void 0);
}
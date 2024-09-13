import { currentTab } from '../currentTab';
import { emitOnCurrentTab } from '../emitter/emitOnCurrentTab';
import { Topic } from './Topic';

export async function verifyAuthorization() {
    const tab = await currentTab();

    if (!tab.url?.includes('app.tvtime.com')) {
        return false;
    }

    return emitOnCurrentTab(Topic.CheckAuthorization, void 0);
}
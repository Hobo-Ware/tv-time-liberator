import { currentTab } from '../currentTab';
import { emitOnCurrentTab } from '../emitter/emitOnCurrentTab';
import { Topic } from './Topic';

export type AuthStatus = 'wrong-tab' | 'unauthorized' | 'authorized';

export async function verifyAuthorization(): Promise<AuthStatus> {
    const tab = await currentTab();

    if (!tab.url?.includes('app.tvtime.com')) {
        return 'wrong-tab';
    }

    const authorized = await emitOnCurrentTab(Topic.CheckAuthorization, void 0);
    return authorized ? 'authorized' : 'unauthorized';
}
import browser from 'webextension-polyfill';
import { toIMDB } from '../../core/api';
import { listener } from './request/listener/listener';
import { Topic } from './request/topic/Topic';

listener(Topic.IMDB, async (options) => await toIMDB(options));

// Downloads run from the extension context (content scripts can't call
// chrome.downloads). A base64 data URL is used rather than a blob URL because
// blob URLs minted in the service worker die when it sleeps mid-download.
listener(Topic.Download, async ({ filename, base64, mime }) => {
    try {
        await browser.downloads.download({
            url: `data:${mime};base64,${base64}`,
            filename,
            saveAs: false,
        });
        return true;
    } catch (error) {
        console.error('[Liberator] download failed', error);
        return false;
    }
});

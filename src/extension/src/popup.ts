import browser from 'webextension-polyfill';

const button = document.querySelector('button')!;

button.addEventListener('click', async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    const tabId = tab.id;

    if (!tab.url?.includes('app.tvtime.com')) {
        // TODO: disable button if not on tvtime.com
        console.log('Not on tvtime.com');
        return;
    }

    browser.tabs.sendMessage(tabId!, { type: 'extract' });
});
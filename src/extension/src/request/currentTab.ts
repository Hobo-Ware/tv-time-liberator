import browser from 'webextension-polyfill';

export async function currentTab() {
    const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
    });

    return tab;
}
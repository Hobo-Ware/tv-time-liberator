import puppeteer from 'puppeteer';
import { URL } from './url.mjs';

export async function getToken() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    console.log('Navigating to TV Time...');
    await page.goto(URL.Browser.Homepage);

    console.log('Waiting for token...');
    await page.waitForFunction(() => {
        return localStorage.getItem('flutter.jwtToken') != null;
    });

    console.log('Token found...');
    const localStorage = await page.evaluate(() => {
        const json = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            json[key] = localStorage.getItem(key);
        }
        return json;
    });

    await browser.close();

    return localStorage['flutter.jwtToken'].slice(1, -1);
}

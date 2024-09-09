import puppeteer from 'puppeteer';
import { Resource } from '../core/http/Resource';
import { assertDefined } from '../core/utils/assertDefined';

export async function getToken() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    console.log('Navigating to TV Time...');
    await page.goto(Resource.Browser.Homepage);

    console.log('Waiting for token...');
    await page.waitForFunction(() => {
        return (localStorage as Storage).getItem('flutter.jwtToken') != null;
    });

    console.log('Token found...');
    const localStorage = await page.evaluate(() => {
        const ls = localStorage as Storage;
        const json: Record<string, string | null> = {};
        for (let i = 0; i < ls.length; i++) {
            const key = ls.key(i) ?? 'unknown';
            json[key] = ls.getItem(key);
        }
        return json;
    });

    await browser.close();

    return assertDefined(localStorage['flutter.jwtToken'], 'Flutter token not found.').slice(1, -1);
}

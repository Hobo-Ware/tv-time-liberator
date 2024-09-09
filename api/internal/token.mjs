import puppeteer from 'puppeteer';

const TV_TIME_URL = 'https://app.tvtime.com/welcome';

export async function getToken() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    console.log('Navigating to TV Time...');
    await page.goto(TV_TIME_URL);

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

import browser from 'webextension-polyfill';
import { toIMDB } from '../../core/api';

browser
    .runtime
    .onMessage
    .addListener(
        async (message: any) => {
            if (message.type !== 'imdb') {
                return false;
            }

            console.log('Extracting...');
            return await toIMDB(message.id, 'movie');
        });

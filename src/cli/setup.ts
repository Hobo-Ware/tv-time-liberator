import { MemoryStorage, WellKnownItem } from '../core/store/MemoryStorage';

const username = process.env.TV_TIME_USERNAME;
if (!username) {
    console.error('Please provide TV_TIME_USERNAME environment variable.');
    process.exit(1);
}
MemoryStorage.set(WellKnownItem.Username, username);

const password = process.env.TV_TIME_PASSWORD;
if (!password) {
    console.error('Please provide TV_TIME_PASSWORD environment variable.');
    process.exit(1);
}
MemoryStorage.set(WellKnownItem.Password, password);
import { FSDB } from 'file-system-db';

export const db = new FSDB('.db/store.json');

export const TvTimeValue = {
    FlutterToken: 'tv_time.flutter_token',
    UserToken: 'tv_time.user',
}

export async function exists(key) {
    return db.has(key);
}

export async function get(key) {
    return db.get(key);
}

export async function set(key, value) {
    return db.set(key, value);
}

export async function remove(key) {
    return db.delete(key);
}

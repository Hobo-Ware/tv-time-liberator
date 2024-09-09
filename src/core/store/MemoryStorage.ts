import { assertDefined } from '../utils/assertDefined';

export enum WellKnownItem {
    Username = 'username',
    Password = 'password',
}

const _store = new Map<WellKnownItem, string>();

export const MemoryStorage = {
    get(item: WellKnownItem): string {
        return assertDefined(_store.get(item), `Store item ${item} is not defined.`);
    },
    set(item: WellKnownItem, value: string): void {
        _store.set(item, value);
    },
    has(item: WellKnownItem): boolean {
        return _store.has(item);
    },
    delete(item: WellKnownItem): void {
        _store.delete(item);
    },
};
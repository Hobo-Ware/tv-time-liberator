import type { Store } from '../store';
import { cache } from './internal/cache';

export function setCache(store: Store): void {
    cache.instance = store;
}
export class MemoryDB {
    constructor(
        private _memory: Record<string, any> = {},
    ) { }

    /**
     * Returns the live in-memory object. Callers must treat it as read-only
     * (e.g. to serialize the store when flushing to disk). It always reflects
     * the current state, including after {@link deleteAll} replaces it.
     */
    snapshot(): Record<string, any> {
        return this._memory;
    }

    async get<T>(path: string): Promise<T | undefined> {
        const keys = path.split('.');

        const container = keys
            .reduce((acc, k) => acc?.[k], this._memory) as T | undefined;

        return container;
    }

    async has(path: string) {
        return await this.get(path) !== undefined;
    }

    async set(path: string, value: any) {
        const keys = path.split('.');

        const container = keys
            .slice(0, -1)
            .reduce((acc, key) => acc[key] = acc[key] ?? {}, this._memory);

        container[keys.pop()!] = value;
    }

    async delete(path: string) {
        const keys = path.split('.');

        const container = keys
            .slice(0, -1)
            .reduce((acc, key) => acc[key], this._memory);
            
        delete container[keys.pop()!];
    }

    async deleteAll() {
        this._memory = {};
    }
}
/**
 * Maps items through an async fn with bounded concurrency, preserving order.
 * Replaces serial `for ... await` loops that fire one request per item -
 * the pattern that made large libraries take hours.
 */
export async function mapPool<T, R>(
    items: T[],
    limit: number,
    fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
    const results = new Array<R>(items.length);
    let cursor = 0;

    async function worker() {
        while (cursor < items.length) {
            const index = cursor++;
            results[index] = await fn(items[index], index);
        }
    }

    const workers = Array.from(
        { length: Math.min(Math.max(1, limit), items.length) },
        worker,
    );
    await Promise.all(workers);

    return results;
}

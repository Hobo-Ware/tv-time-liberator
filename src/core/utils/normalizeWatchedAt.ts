/**
 * TV Time returns `watched_at` in two formats depending on the endpoint:
 *  - bulk watches:       `2024-09-13T10:50:29.147929Z` (ISO with microseconds)
 *  - per-episode info:   `2024-09-13 10:50:49`        (space separated, no TZ)
 *
 * This normalizer collapses both to a millisecond-precision ISO string so
 * downstream consumers (CSV, JSON, fixtures) only need to deal with one form.
 */
export function normalizeWatchedAt(value: string | null | undefined): string | null {
    if (value == null) {
        return null;
    }

    const date = new Date(value.includes('T') ? value : value.replace(' ', 'T') + 'Z');
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
}

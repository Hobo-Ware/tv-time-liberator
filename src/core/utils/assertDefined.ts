export function assertDefined<T>(value: T, error: string): NonNullable<T> {
    if (value === undefined || value === null) {
        throw new Error(error)
    }

    return value;
}
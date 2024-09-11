export function delay(ms = Math.random() * 250): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
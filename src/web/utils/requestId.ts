export function createRequestId(prefix: string = 'req'): string {
    const rand = Math.random().toString(36).slice(2, 10);
    return `${prefix}_${Date.now()}_${rand}`;
}

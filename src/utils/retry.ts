export async function retry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 500) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
        try { return await fn(); } catch (e) { lastErr = e; await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i))); }
    }
    throw lastErr;
}

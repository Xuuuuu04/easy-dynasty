/**
 * Batch rapid stream text updates into animation frames, reducing render churn.
 */
export function createStreamBatcher(updateFn: (text: string) => void) {
    let pendingText = '';
    let rafId: number | null = null;
    let isComplete = false;

    const flush = () => {
        if (pendingText) {
            updateFn(pendingText);
        }
        rafId = null;
    };

    const update = (text: string) => {
        pendingText = text;
        if (!rafId && !isComplete) {
            rafId = requestAnimationFrame(flush);
        }
    };

    const complete = () => {
        isComplete = true;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        flush();
    };

    return { update, complete };
}

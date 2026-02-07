interface StructuredApiError {
    error?: {
        message?: string;
        detail?: string;
    };
    detail?: string;
}

export async function parseApiError(
    response: Response,
    fallbackPrefix: string = '请求失败'
): Promise<string> {
    const fallback = `${fallbackPrefix}: ${response.status}`;

    try {
        const data = (await response.json()) as StructuredApiError;
        if (data?.error?.message) {
            return data.error.message;
        }
        if (data?.error?.detail) {
            return data.error.detail;
        }
        if (data?.detail) {
            return data.detail;
        }
        return fallback;
    } catch {
        return fallback;
    }
}

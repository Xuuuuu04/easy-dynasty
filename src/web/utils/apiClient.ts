import { parseApiError } from '@/utils/apiError';
import { createRequestId } from '@/utils/requestId';

interface ApiRequestOptions {
    method?: string;
    body?: BodyInit | null;
    timeoutMs?: number;
    contentType?: string;
    includeAuth?: boolean;
    headers?: Record<string, string>;
}

export async function apiRequest(
    path: string,
    {
        method = 'GET',
        body = null,
        timeoutMs = 120000,
        contentType = 'application/json',
        includeAuth = true,
        headers = {},
    }: ApiRequestOptions = {}
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    const token = includeAuth ? localStorage.getItem('token') : null;

    try {
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}${path}`, {
            method,
            signal: controller.signal,
            body,
            headers: {
                ...(contentType ? { 'Content-Type': contentType } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-Request-ID': createRequestId('web'),
                ...headers,
            },
        });
    } finally {
        window.clearTimeout(timeoutId);
    }
}

export async function assertOk(response: Response, fallbackPrefix: string): Promise<void> {
    if (response.ok) return;
    throw new Error(await parseApiError(response, fallbackPrefix));
}

import json
from typing import Any, AsyncGenerator, Iterable, Optional

import httpx

from app.core.error_response import build_error_payload
from app.core.logger import logger

SSE_HEADERS = {
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
}

def format_sse(payload: dict[str, Any]) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


async def stream_chat_completion(
    *,
    api_key: str,
    base_url: str,
    model: str,
    messages: Iterable[dict[str, str]],
    request_id: Optional[str] = None,
) -> AsyncGenerator[str, None]:
    timeout = httpx.Timeout(connect=10.0, read=70.0, write=20.0, pool=20.0)
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if request_id:
        headers["X-Request-ID"] = request_id
    payload = {
        "model": model,
        "messages": list(messages),
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            async with client.stream(
                "POST",
                f"{base_url.rstrip('/')}/chat/completions",
                headers=headers,
                json=payload,
            ) as response:
                if response.status_code != 200:
                    detail = (await response.aread()).decode("utf-8", errors="ignore")[:500]
                    logger.error(
                        "[rid:%s] LLM upstream request failed. status=%s body=%s",
                        request_id or "-",
                        response.status_code,
                        detail,
                    )
                    yield format_sse(
                        build_error_payload(
                            "LLM service request failed",
                            code="LLM_UPSTREAM_ERROR",
                            status=response.status_code,
                            detail=detail,
                        )
                    )
                    return

                async for line in response.aiter_lines():
                    if line.startswith("data:"):
                        yield f"{line.strip()}\n\n"
        except httpx.TimeoutException:
            logger.warning("[rid:%s] LLM upstream timeout", request_id or "-")
            yield format_sse(
                build_error_payload(
                    "LLM service timeout",
                    code="LLM_TIMEOUT",
                    status=504,
                )
            )
        except Exception as exc:
            logger.exception("[rid:%s] LLM stream failed: %s", request_id or "-", exc)
            yield format_sse(
                build_error_payload(
                    "LLM stream failed",
                    code="LLM_STREAM_ERROR",
                    status=500,
                    detail=str(exc),
                )
            )

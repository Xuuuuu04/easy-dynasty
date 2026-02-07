import asyncio

import httpx

from app.core.config import settings
from main import app


def _build_analyze_payload() -> dict:
    return {
        "question": "测试问题",
        "spreadName": "单张牌",
        "spreadId": "single_card",
        "drawnCards": [
            {
                "card": {"id": "0", "name": "愚者", "englishName": "The Fool"},
                "isReversed": False,
                "position": {"id": 1, "name": "现状", "description": "当前状态"},
            }
        ],
    }


def test_analyze_returns_structured_error_when_api_key_missing():
    settings.SECRET_KEY = "test-secret"
    settings.DEFAULT_LLM_API_KEY = ""

    async def run():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.post("/api/v1/tarot/analyze", json=_build_analyze_payload())

    res = asyncio.run(run())

    assert res.status_code == 500
    body = res.json()
    assert body["error"]["code"] == "HTTP_ERROR"
    assert body["error"]["message"] == "LLM API Key not configured"


def test_analyze_streams_sse_with_request_id(monkeypatch):
    settings.SECRET_KEY = "test-secret"
    settings.DEFAULT_LLM_API_KEY = "dummy-key"

    async def fake_stream_chat_completion(**kwargs):
        yield 'data: {"content":"hello"}\n\n'
        yield 'data: [DONE]\n\n'

    monkeypatch.setattr(
        "app.api.endpoints.tarot.stream_chat_completion",
        fake_stream_chat_completion,
    )

    async def run():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.post("/api/v1/tarot/analyze", json=_build_analyze_payload())

    res = asyncio.run(run())

    assert res.status_code == 200
    assert res.headers.get("content-type", "").startswith("text/event-stream")
    assert res.headers.get("x-request-id")
    assert 'data: {"content":"hello"}' in res.text

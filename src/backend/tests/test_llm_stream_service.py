import json

from app.core.error_response import build_error_payload
from app.services.llm_stream_service import format_sse


def test_build_error_payload_shape():
    payload = build_error_payload(
        "LLM service timeout",
        code="LLM_TIMEOUT",
        status=504,
        detail="upstream timed out",
    )

    assert payload["error"]["message"] == "LLM service timeout"
    assert payload["error"]["code"] == "LLM_TIMEOUT"
    assert payload["error"]["status"] == 504
    assert payload["error"]["detail"] == "upstream timed out"


def test_format_sse_is_valid_data_line():
    payload = build_error_payload("failed", code="E1", status=500)
    sse = format_sse(payload)

    assert sse.startswith("data: ")
    assert sse.endswith("\n\n")
    parsed = json.loads(sse[len("data: ") :].strip())
    assert parsed["error"]["code"] == "E1"

from typing import Any


def build_error_payload(
    message: str,
    *,
    code: str,
    status: int,
    detail: Any = None,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "error": {
            "message": message,
            "code": code,
            "status": status,
        }
    }
    if detail is not None and detail != "":
        payload["error"]["detail"] = detail
    return payload

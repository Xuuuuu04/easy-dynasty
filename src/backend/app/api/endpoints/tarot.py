from datetime import datetime

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.core.logger import logger
from app.schemas.tarot import TarotChatRequest, TarotRequest
from app.services.llm_stream_service import SSE_HEADERS, stream_chat_completion
from app.services.settings_service import SettingsService

router = APIRouter()


def _get_llm_config() -> tuple[str, str, str]:
    api_key = SettingsService.get("DEFAULT_LLM_API_KEY")
    base_url = SettingsService.get(
        "LLM_BASE_URL",
        SettingsService.get("DEFAULT_LLM_BASE_URL", "https://api.siliconflow.cn/v1"),
    ).rstrip("/")
    model = SettingsService.get("TAROT_MODEL", "Qwen/Qwen3-Next-80B-A3B-Instruct")
    return api_key, base_url, model


def _build_streaming_response(stream_factory):
    return StreamingResponse(
        stream_factory(),
        media_type="text/event-stream",
        headers=SSE_HEADERS,
    )


def _build_analysis_prompts(req: TarotRequest) -> tuple[str, str]:
    current_date = datetime.now().strftime("%Y年%m月%d日")
    cards_str = ""
    for idx, dc in enumerate(req.drawnCards):
        status = "逆位" if dc.isReversed else "正位"
        cards_str += f"{idx+1}. {dc.position.get('name')}: {dc.card.name} ({status})\n"

    system_prompt = (
        f"你是一位精通神秘学、象征学与心理学的顶级塔罗占卜师。今天是{current_date}。"
        "你的风格庄重、富有同理心且极具启发性。请根据牌面，结合心理学原型与传统牌意，"
        "为用户提供深度的命运指引。"
    )
    user_prompt = (
        f"我的问题是：{req.question}\n使用的牌阵是：{req.spreadName}\n我抽到的牌有：\n{cards_str}\n"
        "请基于这些牌面，为我揭示潜意识的讯息并给出行动建议。输出请使用优雅的 Markdown 格式。"
    )
    return system_prompt, user_prompt


@router.post("/analyze")
async def analyze_tarot(req: TarotRequest, request: Request):
    api_key, base_url, model = _get_llm_config()
    request_id = getattr(request.state, "request_id", "-")

    logger.info(f"[rid:{request_id}] Tarot Analysis Request - Model: {model}, Base URL: {base_url}")
    if api_key:
        logger.info(f"API Key used: {api_key[:5]}...{api_key[-5:]}")
    else:
        logger.error("API Key is empty")

    if not api_key:
        raise HTTPException(status_code=500, detail="LLM API Key not configured")

    system_prompt, user_prompt = _build_analysis_prompts(req)

    async def stream_response():
        async for chunk in stream_chat_completion(
            api_key=api_key,
            base_url=base_url,
            model=model,
            request_id=request_id,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        ):
            yield chunk

    return _build_streaming_response(stream_response)


@router.post("/chat")
async def chat_tarot(req: TarotChatRequest, request: Request):
    api_key, base_url, model = _get_llm_config()
    request_id = getattr(request.state, "request_id", "-")
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM API Key not configured")

    async def stream_response():
        async for chunk in stream_chat_completion(
            api_key=api_key,
            base_url=base_url,
            model=model,
            request_id=request_id,
            messages=[
                {"role": "system", "content": f"当前日期：{datetime.now().strftime('%Y年%m月%d日')}。"}
            ]
            + [{"role": m.role, "content": m.content} for m in req.messages],
        ):
            yield chunk

    return _build_streaming_response(stream_response)

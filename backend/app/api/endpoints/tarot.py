import json
from datetime import datetime

import httpx
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from fastapi_limiter.depends import RateLimiter

from app.core.logger import logger
from app.schemas.tarot import TarotChatRequest, TarotRequest
from app.services.settings_service import SettingsService

router = APIRouter()


@router.post("/analyze", dependencies=[Depends(RateLimiter(times=5, seconds=60))])
async def analyze_tarot(req: TarotRequest):
    api_key = SettingsService.get("DEFAULT_LLM_API_KEY")
    base_url = SettingsService.get("LLM_BASE_URL", "https://api.siliconflow.cn/v1")
    model = SettingsService.get("TAROT_MODEL", "moonshotai/Kimi-K2-Instruct-0905")

    logger.info(f"Tarot Analysis - Model: {model}, Base URL: {base_url}")

    current_date = datetime.now().strftime("%Y年%m月%d日")
    cards_str = ""
    for idx, dc in enumerate(req.drawnCards):
        status = "逆位" if dc.isReversed else "正位"
        cards_str += f"{idx+1}. {dc.position.get('name')}: {dc.card.name} ({status})\n"

    system_prompt = f"你是一位精通神秘学、象征学与心理学的顶级塔罗占卜师。今天是{current_date}。你的风格庄重、富有同理心且极具启发性。请根据牌面，结合心理学原型与传统牌意，为用户提供深度的命运指引。"
    user_prompt = f"我的问题是：{req.question}\n使用的牌阵是：{req.spreadName}\n我抽到的牌有：\n{cards_str}\n请基于这些牌面，为我揭示潜意识的讯息并给出行动建议。输出请使用优雅的 Markdown 格式。"

    async def stream_response():
        async with httpx.AsyncClient() as client:
            try:
                async with client.stream(
                    "POST",
                    f"{base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={
                        "model": model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "stream": True,
                    },
                    timeout=60.0,
                ) as response:
                    if response.status_code != 200:
                        yield f"data: {json.dumps({'error': f'LLM Service Error: {response.status_code}'})}\n\n"
                        return
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            yield f"{line}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(stream_response(), media_type="text/event-stream")


@router.post("/chat", dependencies=[Depends(RateLimiter(times=10, seconds=60))])
async def chat_tarot(req: TarotChatRequest):
    api_key = SettingsService.get("DEFAULT_LLM_API_KEY")
    base_url = SettingsService.get("LLM_BASE_URL", "https://api.siliconflow.cn/v1")
    model = SettingsService.get("TAROT_MODEL", "moonshotai/Kimi-K2-Instruct-0905")

    async def stream_response():
        async with httpx.AsyncClient() as client:
            try:
                async with client.stream(
                    "POST",
                    f"{base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={
                        "model": model,
                        "messages": [
                            {"role": "system", "content": f"当前日期：{datetime.now().strftime('%Y年%m月%d日')}。"}
                        ] + [{"role": m.role, "content": m.content} for m in req.messages],
                        "stream": True,
                    },
                    timeout=60.0,
                ) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            yield f"{line}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(stream_response(), media_type="text/event-stream")

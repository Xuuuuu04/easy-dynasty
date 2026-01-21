from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.api.endpoints.auth import get_current_user, get_db
from app.schemas.auth import User
from app.schemas.tarot import TarotRequest, TarotChatRequest
from app.services.quota_service import QuotaService
from app.services.settings_service import SettingsService
from fastapi_limiter.depends import RateLimiter
import httpx
import json
import os

router = APIRouter()

@router.post("/analyze", dependencies=[Depends(RateLimiter(times=5, seconds=60))])
async def analyze_tarot(req: TarotRequest, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    QuotaService.check_quota(db, current_user.id, 'tarot')

    api_key = SettingsService.get("DEFAULT_LLM_API_KEY")
    base_url = SettingsService.get("LLM_BASE_URL", "https://api.siliconflow.cn/v1")
    model = SettingsService.get("TAROT_MODEL", "moonshotai/Kimi-K2-Instruct-0905")

    cards_str = ""
    for idx, dc in enumerate(req.drawnCards):
        status = "逆位" if dc.isReversed else "正位"
        cards_str += f"{idx+1}. {dc.position.get('name')}: {dc.card.name} ({status})\n"

    system_prompt = "你是一位精通神秘学、象征学与心理学的顶级塔罗占卜师。你的风格庄重、富有同理心且极具启发性。请根据牌面，结合心理学原型与传统牌意，为用户提供深度的命运指引。"
    user_prompt = f"我的问题是：{req.question}\n使用的牌阵是：{req.spreadName}\n我抽到的牌有：\n{cards_str}\n请基于这些牌面，为我揭示潜意识的讯息并给出行动建议。输出请使用优雅的 Markdown 格式。"

    async def stream_response():
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{base_url}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "stream": True
                },
                timeout=60.0
            ) as response:
                if response.status_code != 200:
                    yield f"data: {json.dumps({'error': 'LLM Service Error'})}\n\n"
                    return
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        yield f"{line}\n\n"
        
        QuotaService.increment_usage(db, current_user.id, 'tarot')

    return StreamingResponse(stream_response(), media_type="text/event-stream")

@router.post("/chat", dependencies=[Depends(RateLimiter(times=10, seconds=60))])
async def chat_tarot(req: TarotChatRequest, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    if current_user.tier != 'svip':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="进一步提问仅限高级SVIP用户")

    api_key = SettingsService.get("DEFAULT_LLM_API_KEY")
    base_url = SettingsService.get("LLM_BASE_URL", "https://api.siliconflow.cn/v1")
    model = SettingsService.get("TAROT_MODEL", "moonshotai/Kimi-K2-Instruct-0905")

    async def stream_response():
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{base_url}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": model,
                    "messages": [{"role": m.role, "content": m.content} for m in req.messages],
                    "stream": True
                },
                timeout=60.0
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        yield f"{line}\n\n"

    return StreamingResponse(stream_response(), media_type="text/event-stream")
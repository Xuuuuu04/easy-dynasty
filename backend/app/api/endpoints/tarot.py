from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.api.endpoints.auth import get_current_user, get_db
from app.schemas.auth import User
from app.schemas.tarot import TarotRequest, TarotChatRequest
from app.services.quota_service import QuotaService
from app.core.config import settings
from sqlalchemy import text
import httpx
import json
import os

router = APIRouter()

BASE_URL = "https://api.siliconflow.cn/v1"
API_KEY = os.getenv("DEFAULT_LLM_API_KEY")
MODEL = "moonshotai/Kimi-K2-Instruct-0905"

@router.post("/analyze")

async def analyze_tarot(req: TarotRequest, current_user: User = Depends(get_current_user), db = Depends(get_db)):

    # 1. Check Quota

    QuotaService.check_quota(db, current_user.id, 'tarot')



    # 2. Construct Prompt
    # Sync with frontend logic
    # Since we want to keep logic consistent, we'll use a simplified version or replicate the frontend prompt builder
    cards_str = ""
    for idx, dc in enumerate(req.drawnCards):
        status = "逆位" if dc.isReversed else "正位"
        cards_str += f"{idx+1}. {dc.position.get('name')}: {dc.card.name} ({status})\n"

    system_prompt = "你是一位专业的塔罗牌占卜师。请根据用户的问题、选择的牌阵以及抽到的牌面进行深入、客观、且富有启发性的解读。"
    user_prompt = f"我的问题是：{req.question}\n使用的牌阵是：{req.spreadName}\n我抽到的牌有：\n{cards_str}\n请开始你的解读。"

    # 3. Call LLM
    async def stream_response():
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {API_KEY}"},
                json={
                    "model": MODEL,
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
        
        # 4. Increment usage after successful start of stream
        QuotaService.increment_usage(db, current_user.id, 'tarot')

    return StreamingResponse(stream_response(), media_type="text/event-stream")

@router.post("/chat")
async def chat_tarot(req: TarotChatRequest, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    # ONLY SVIP can chat further
    if current_user.tier != 'svip':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="进一步提问功能仅限高级SVIP用户使用。请升级您的会员等级。"
        )

    # 2. Call LLM
    async def stream_response():
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {API_KEY}"},
                json={
                    "model": MODEL,
                    "messages": [{"role": m.role, "content": m.content} for m in req.messages],
                    "stream": True
                },
                timeout=60.0
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        yield f"{line}\n\n"

    return StreamingResponse(stream_response(), media_type="text/event-stream")

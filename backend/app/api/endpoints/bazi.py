from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
from app.schemas.bazi import BaziRequest, BaziResponse
from app.api.endpoints.auth import get_current_user, get_db
from app.schemas.auth import User
from app.schemas.tarot import TarotChatRequest
from app.services.bazi_calculator import analyze_bazi
from app.services.quota_service import QuotaService
from app.services.bazi_rag_service import bazi_rag_service
from sqlalchemy import text
from fastapi_limiter.depends import RateLimiter
import json

router = APIRouter()

@router.post("/calculate", response_model=BaziResponse)
async def calculate_bazi(request: BaziRequest, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    # 1. Check Quota
    QuotaService.check_quota(db, current_user.id, 'bazi')

    try:
        result = await analyze_bazi(request)
        # 2. Increment usage
        QuotaService.increment_usage(db, current_user.id, 'bazi')
        return result
    except Exception as e:
        import traceback
        print(f"八字计算错误: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze", dependencies=[Depends(RateLimiter(times=5, seconds=60))])
async def analyze_bazi_ai(request: BaziRequest, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    if current_user.tier == 'free':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI 深度分析功能仅限 VIP/SVIP 用户使用。请升级会员获取完整解读。"
        )
    
    QuotaService.check_quota(db, current_user.id, 'bazi')

    # 1. Get Bazi Data
    bazi_result = await analyze_bazi(request)
    bazi_data = bazi_result.model_dump()
    query = request.query or "请从格局、用神、大运流年等方面进行详细解读。"

    # 2. SVIP gets RAG, others get basic AI
    if current_user.tier == 'svip':
        return StreamingResponse(bazi_rag_service.analyze_with_rag(bazi_data, query, gender=request.gender), media_type="text/event-stream")
    else:
        # Basic AI Analysis (VIP) - No RAG, but same structured report
        from app.services.bazi_rag_service import LLM_MODEL, API_KEY, BASE_URL
        import httpx
        
        time_context = bazi_rag_service.get_current_time_context()
        gender_str = "男" if request.gender == "male" else "女" if request.gender == "female" else "未知"

        system_prompt = f"""你是一位专业的命理分析师。
请根据提供的排盘数据和当前时间，为用户生成一份八字命理分析报告。

【当前时空】
{time_context}

请严格按照以下结构输出报告：
# 八字智能启示

## I. 运势概览
> 简要描述当前年份的整体运势基调。

## II. 命局核心
*格局、五行旺衰、喜用神简单分析。*

## III. 运势分析
*针对当前流年、事业、财富、感情的简要分析。*

## IV. 建议
*具体的趋吉避凶建议。*

注意：你的分析应通俗易懂，虽然不要求引经据典，但逻辑必须严密。
如果使用表格，请务必保证标准 Markdown 格式，每一行必须换行。
"""

        async def stream_basic():
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    f"{BASE_URL}/chat/completions",
                    headers={"Authorization": f"Bearer {API_KEY}"},
                    json={
                        "model": LLM_MODEL,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": f"性别：{gender_str}\n数据：{str(bazi_data)}\n问题：{query}"}
                        ],
                        "stream": True
                    },
                    timeout=60.0
                ) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            yield f"{line}\n\n"
        
        return StreamingResponse(stream_basic(), media_type="text/event-stream")

@router.post("/chat", dependencies=[Depends(RateLimiter(times=10, seconds=60))])
async def chat_bazi(req: TarotChatRequest, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    # ONLY SVIP can chat further in Bazi as well
    if current_user.tier != 'svip':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="进一步提问功能仅限高级SVIP用户使用。请升级您的会员等级。"
        )

    from app.services.bazi_rag_service import LLM_MODEL, API_KEY, BASE_URL
    import httpx
    
    async def stream_response():
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {API_KEY}"},
                json={
                    "model": LLM_MODEL,
                    "messages": [{"role": m.role, "content": m.content} for m in req.messages],
                    "stream": True
                },
                timeout=60.0
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        yield f"{line}\n\n"

    return StreamingResponse(stream_response(), media_type="text/event-stream")

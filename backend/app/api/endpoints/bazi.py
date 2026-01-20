from fastapi import APIRouter, HTTPException
from app.schemas.bazi import BaziRequest, BaziResponse
from app.services.bazi_calculator import analyze_bazi

router = APIRouter()

@router.post("/calculate", response_model=BaziResponse)
async def calculate_bazi(request: BaziRequest):
    try:
        import logging
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        logger.info(f"收到八字计算请求: {request}")
        result = await analyze_bazi(request)
        return result
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"八字计算错误: {error_detail}")
        raise HTTPException(status_code=500, detail=f"{str(e)}\n{error_detail}")

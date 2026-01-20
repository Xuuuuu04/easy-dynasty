from fastapi import APIRouter
from app.api.endpoints import bazi, tools

api_router = APIRouter()
api_router.include_router(bazi.router, prefix="/bazi", tags=["bazi"])
api_router.include_router(tools.router, prefix="/tools", tags=["tools"])
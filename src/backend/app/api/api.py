from fastapi import APIRouter

from app.api.endpoints import tarot

api_router = APIRouter()
api_router.include_router(tarot.router, prefix="/tarot", tags=["tarot"])

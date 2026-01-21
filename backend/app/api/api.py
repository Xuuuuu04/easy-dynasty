from fastapi import APIRouter
from app.api.endpoints import bazi, tools, auth, payment, tarot, admin, history, profiles, feedback

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(bazi.router, prefix="/bazi", tags=["bazi"])
api_router.include_router(tools.router, prefix="/tools", tags=["tools"])
api_router.include_router(payment.router, prefix="/payment", tags=["payment"])
api_router.include_router(tarot.router, prefix="/tarot", tags=["tarot"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
api_router.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
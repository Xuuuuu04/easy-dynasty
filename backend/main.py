from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api import api_router
from app.core.logger import logger
import time
import redis.asyncio as redis
from fastapi_limiter import FastAPILimiter

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    try:
        redis_instance = redis.from_url("redis://localhost:6379", encoding="utf-8", decode_responses=True)
        await FastAPILimiter.init(redis_instance)
        logger.info("Redis Limiter initialized")
    except Exception as e:
        logger.warning(f"Redis Limiter failed to initialize: {e}. Rate limiting will be disabled.")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    
    # Log to file
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.2f}ms")
    
    return response

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to Tarot API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

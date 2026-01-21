from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api import api_router
from app.core.logger import logger, log_api_call_to_db
from app.core.security import SECRET_KEY, ALGORITHM
from jose import jwt
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
    
    # Extract User ID if possible
    user_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            # We only have username in token, need to lookup ID if we want exact FK
            # For performance, we might just skip ID or cache it. 
            # To keep middleware fast, let's just log username if ID lookup is too slow, 
            # BUT the db schema expects INT user_id.
            # OPTION: Just decode username, and we can fetch ID asynchronously or skip.
            # Let's skip ID for now in middleware to avoid DB read on every request, 
            # or rely on the cached username->id map if we had one.
            # For enterprise accuracy, let's just log the request basic info.
            # Or better: The `get_current_user` dependency already ran for protected routes.
            # Middleware runs OUTSIDE that scope.
            # Let's try a quick DB lookup in the async task if really needed, or leave user_id NULL for now.
            pass 
        except:
            pass
    
    # Log to file
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.2f}ms")
    
    # Log to DB (Async)
    # We pass None for user_id for now to avoid overhead, or we can improve this later.
    await log_api_call_to_db(
        user_id=None, 
        endpoint=request.url.path, 
        method=request.method, 
        status_code=response.status_code, 
        process_time_ms=process_time,
        ip=request.client.host
    )
    
    return response

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to EasyDynasty API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "db_connection": "pending_check"}

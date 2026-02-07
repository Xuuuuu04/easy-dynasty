import time
import os
import uuid
from contextlib import asynccontextmanager

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv() -> None:
        return None

load_dotenv()

import redis.asyncio as redis
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter

from app.api.api import api_router
from app.core.config import settings
from app.core.error_response import build_error_payload
from app.core.logger import logger

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not settings.SECRET_KEY:
        raise RuntimeError("SECRET_KEY is required. Please configure it in backend/.env")

    try:
        redis_instance = redis.from_url(
            settings.REDIS_URL, encoding="utf-8", decode_responses=True
        )
        await FastAPILimiter.init(redis_instance)
        logger.info("Redis Limiter initialized")
    except Exception as e:
        logger.warning(
            f"Redis Limiter failed to initialize: {e}. Rate limiting will be disabled."
        )

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Parse comma separated origins and keep sane defaults.
raw_origins = settings.CORS_ORIGINS.strip()
allow_all_origins = raw_origins == "*"
cors_origins = ["*"] if allow_all_origins else [x.strip() for x in raw_origins.split(",") if x.strip()]

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail = exc.detail
    message = detail if isinstance(detail, str) and detail else "Request failed"
    return JSONResponse(
        status_code=exc.status_code,
        content=build_error_payload(
            message,
            code="HTTP_ERROR",
            status=exc.status_code,
            detail=None if isinstance(detail, str) else detail,
        ),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=build_error_payload(
            "Validation failed",
            code="VALIDATION_ERROR",
            status=422,
            detail=exc.errors(),
        ),
    )


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id
    try:
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
    except Exception:
        process_time = (time.time() - start_time) * 1000
        logger.exception(
            f"[rid:{request_id}] {request.method} {request.url.path} - 500 - {process_time:.2f}ms (unhandled error)"
        )
        raise
    finally:
        process_time = (time.time() - start_time) * 1000
        if "response" in locals():
            logger.info(
                f"[rid:{request_id}] {request.method} {request.url.path} - {response.status_code} - {process_time:.2f}ms"
            )


app.include_router(api_router, prefix=settings.API_V1_STR)

# Get absolute path to html-web directory
# Assuming main.py is in backend/ and html-web is in project root (../html-web)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_WEB_DIR = os.path.join(BASE_DIR, "html-web")

# Verify directory exists before mounting
if os.path.exists(HTML_WEB_DIR):
    # Mount static files
    app.mount("/css", StaticFiles(directory=os.path.join(HTML_WEB_DIR, "css")), name="css")
    app.mount("/js", StaticFiles(directory=os.path.join(HTML_WEB_DIR, "js")), name="js")
    app.mount("/assets", StaticFiles(directory=os.path.join(HTML_WEB_DIR, "assets")), name="assets")

    @app.get("/")
    async def read_index():
        return FileResponse(os.path.join(HTML_WEB_DIR, "index.html"))

    @app.get("/{page_name}.html")
    async def read_html(page_name: str):
        file_path = os.path.join(HTML_WEB_DIR, f"{page_name}.html")
        if os.path.exists(file_path):
            return FileResponse(file_path)
        raise HTTPException(status_code=404, detail="Page not found")
else:
    logger.warning(f"HTML directory not found at {HTML_WEB_DIR}")

    @app.get("/")
    def root():
        return {"message": "Welcome to Tarot API (HTML frontend not found)"}


@app.get("/health")
def health_check():
    return JSONResponse(content={"status": "ok"})

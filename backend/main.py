import time
from dotenv import load_dotenv

load_dotenv()

import redis.asyncio as redis
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter

from app.api.api import api_router
from app.core.config import settings
from app.core.logger import logger

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        redis_instance = redis.from_url(
            "redis://localhost:6379", encoding="utf-8", decode_responses=True
        )
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
    logger.info(
        f"{request.method} {request.url.path} - {response.status_code} - {process_time:.2f}ms"
    )

    return response


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
        return {"error": "Page not found"}, 404
else:
    logger.warning(f"HTML directory not found at {HTML_WEB_DIR}")

    @app.get("/")
    def root():
        return {"message": "Welcome to Tarot API (HTML frontend not found)"}


@app.get("/health")
def health_check():
    return {"status": "ok"}

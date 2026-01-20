import logging
import os
from logging.handlers import RotatingFileHandler
from sqlalchemy import text
from app.db.session import SessionLocal
import asyncio
from functools import partial

# --- Configuration ---
LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs")
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

LOG_FILE = os.path.join(LOG_DIR, "system.log")

# --- Setup Standard Logger ---
logger = logging.getLogger("EasyDynasty")
logger.setLevel(logging.INFO)

# File Handler (10MB per file, keep 5 backups)
file_handler = RotatingFileHandler(LOG_FILE, maxBytes=10*1024*1024, backupCount=5, encoding='utf-8')
file_formatter = logging.Formatter('%(asctime)s [%(levelname)s] [%(module)s] %(message)s')
file_handler.setFormatter(file_formatter)

# Console Handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(file_formatter)

if not logger.handlers:
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

# --- Async DB Logging Helper ---

async def log_api_call_to_db(user_id: int | None, endpoint: str, method: str, status_code: int, process_time_ms: float, ip: str, tokens: int = 0):
    """
    Asynchronously log API calls to the database for analytics.
    Running in a separate thread/task to avoid blocking the main response.
    """
    def _write():
        db = SessionLocal()
        try:
            db.execute(text("""
                INSERT INTO api_logs 
                (user_id, endpoint, method, status_code, process_time_ms, tokens_used, ip_address) 
                VALUES (:uid, :ep, :meth, :sc, :time, :tok, :ip)
            """), {
                "uid": user_id,
                "ep": endpoint,
                "meth": method,
                "sc": status_code,
                "time": process_time_ms,
                "tok": tokens,
                "ip": ip
            })
            db.commit()
        except Exception as e:
            logger.error(f"Failed to write API log to DB: {e}")
        finally:
            db.close()

    # Use asyncio to offload to thread pool
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, _write)

def log_order_event(order_id: str, message: str):
    logger.info(f"[ORDER:{order_id}] {message}")

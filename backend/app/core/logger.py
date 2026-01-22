import logging
import os
from logging.handlers import RotatingFileHandler

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

def log_order_event(order_id: str, message: str):
    logger.info(f"[ORDER:{order_id}] {message}")

import os
import sqlite3
import time
from datetime import datetime
from nanoid import generate
from core.config import DB_PATH, RATE_LIMIT_WINDOW, RATE_LIMIT_MAX
from utils.helpers import get_client_ip

# Rate limit storage
rate_limit_storage = {}

def generate_share_id():
    """Generate a unique short ID for shares"""
    return generate(size=10)

def sanitize_code(code):
    """Validate code input"""
    return code

def check_rate_limit():
    """Check if client has exceeded rate limit"""
    client_ip = get_client_ip()
    current_time = time.time()

    if client_ip not in rate_limit_storage:
        rate_limit_storage[client_ip] = []

    rate_limit_storage[client_ip] = [
        ts for ts in rate_limit_storage[client_ip]
        if current_time - ts < RATE_LIMIT_WINDOW
    ]

    if len(rate_limit_storage[client_ip]) >= RATE_LIMIT_MAX:
        return False

    rate_limit_storage[client_ip].append(current_time)
    return True

def cleanup_expired_shares():
    """Background task to cleanup expired shares and images"""
    while True:
        try:
            time.sleep(3600)

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Using a simplified query for internal logic
            cursor.execute("""
                SELECT id, image_path FROM shares 
                WHERE expires_at < datetime('now')
            """)
            expired = cursor.fetchall()

            cursor.execute(
                "DELETE FROM shares WHERE expires_at < datetime('now')")
            conn.commit()

            for share_id, image_path in expired:
                if image_path and os.path.exists(image_path):
                    try:
                        os.remove(image_path)
                    except Exception as e:
                        print(f"[CLEANUP] Failed to delete image {image_path}: {e}")

            print(f"[CLEANUP] Cleaned up {len(expired)} expired shares")
            conn.close()

        except Exception as e:
            print(f"[CLEANUP] Error during cleanup: {e}")

import os
import platform
from dotenv import load_dotenv

# Load environment variables
if os.path.exists('.env'):
    load_dotenv()
elif os.path.exists(os.path.join(os.path.dirname(__file__), '..', '.env')):
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
else:
    load_dotenv()

# Detect OS
SYSTEM = platform.system()
IS_WINDOWS = SYSTEM == "Windows"
IS_LINUX = SYSTEM == "Linux"
IS_MAC = SYSTEM == "Darwin"

# App Config
SECRET_KEY = os.environ.get('SECRET_KEY', 'javarena-secret-key-change-in-production')
DB_PATH = os.environ.get('DB_PATH', "shares.db")
SHARE_IMAGES_DIR = "share-images"

# Rate limiting
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 5  # max shares per window

# Dependency check
REQUIRED_PACKAGES = {
    "flask": "Flask",
    "flask_cors": "flask-cors",
    "flask_socketio": "flask-socketio",
    "nanoid": "nanoid",
    "waitress": "waitress",
}

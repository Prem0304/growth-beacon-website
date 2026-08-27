import os

# GROWTHBEACON CRM — PRODUCTION CONFIGURATION
PORT = int(os.environ.get('PORT', 8080))
DB_FILE = os.environ.get('DB_FILE', 'growth_beacon_crm.db')
UPLOADS_DIR = os.environ.get('UPLOADS_DIR', 'uploads')
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'https://www.growthbeacon.co.in,https://app.growthbeacon.co.in,http://localhost:8080,http://127.0.0.1:8080').split(',')
SESSION_EXPIRY_HOURS = 8
FAILED_LOGIN_LOCKOUT_MINUTES = 15
MAX_FAILED_LOGIN_ATTEMPTS = 5

os.makedirs(UPLOADS_DIR, exist_ok=True)

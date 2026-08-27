import hashlib
import os
import secrets
from datetime import datetime, timedelta
from backend.database import Database
from backend.config import SESSION_EXPIRY_HOURS, FAILED_LOGIN_LOCKOUT_MINUTES, MAX_FAILED_LOGIN_ATTEMPTS

class Security:
    @staticmethod
    def hash_password(password: str) -> str:
        """NIST Scrypt password hashing with unique 16-byte salt per password"""
        salt = os.urandom(16)
        # scrypt(password, salt=salt, n=16384, r=8, p=1)
        h = hashlib.scrypt(password.encode('utf-8'), salt=salt, n=16384, r=8, p=1)
        return f"scrypt$16384$8$1${salt.hex()}${h.hex()}"

    @staticmethod
    def verify_password(password: str, stored_hash: str) -> bool:
        """Verifies password against per-user scrypt salt or legacy hash"""
        if not stored_hash:
            return False
        
        if stored_hash.startswith("scrypt$"):
            try:
                parts = stored_hash.split("$")
                n = int(parts[1])
                r = int(parts[2])
                p = int(parts[3])
                salt = bytes.fromhex(parts[4])
                expected = parts[5]
                computed = hashlib.scrypt(password.encode('utf-8'), salt=salt, n=n, r=r, p=p).hex()
                return secrets.compare_digest(computed, expected)
            except Exception:
                return False
        else:
            # Fallback legacy scrypt check for initial seed passwords
            salt = "growthbeacon_crm_salt_2026"
            computed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
            return secrets.compare_digest(computed, stored_hash)

    @staticmethod
    def create_session(user_id: int, ip_address: str, user_agent: str):
        token = secrets.token_hex(32)
        csrf_token = secrets.token_hex(32)
        expires_at = (datetime.now() + timedelta(hours=SESSION_EXPIRY_HOURS)).strftime('%Y-%m-%d %H:%M:%S')

        query = """
            INSERT INTO sessions (id, user_id, created_at, expires_at, ip_address, user_agent, csrf_token)
            VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)
        """
        Database.execute_write(query, (token, user_id, expires_at, ip_address, user_agent, csrf_token))
        return token, csrf_token

    @staticmethod
    def get_session(session_id: str):
        if not session_id:
            return None
        query = """
            SELECT s.id as session_id, s.csrf_token, u.id as user_id, u.name, u.email, u.phone, u.client_id, u.avatar_url, r.name as role_name, u.failed_login_attempts, u.lockout_until
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            JOIN roles r ON u.role_id = r.id
            WHERE s.id = ? AND s.expires_at > DATETIME('now') AND (u.lockout_until IS NULL OR u.lockout_until < DATETIME('now'))
        """
        return Database.execute_single(query, (session_id,))

    @staticmethod
    def invalidate_session(session_id: str):
        if session_id:
            Database.execute_write("DELETE FROM sessions WHERE id = ?", (session_id,))

    @staticmethod
    def record_failed_login(email: str):
        user = Database.execute_single("SELECT id, failed_login_attempts FROM users WHERE email = ?", (email,))
        if user:
            attempts = (user['failed_login_attempts'] or 0) + 1
            lockout_until = None
            if attempts >= MAX_FAILED_LOGIN_ATTEMPTS:
                lockout_until = (datetime.now() + timedelta(minutes=FAILED_LOGIN_LOCKOUT_MINUTES)).strftime('%Y-%m-%d %H:%M:%S')
            Database.execute_write("UPDATE users SET failed_login_attempts = ?, lockout_until = ? WHERE id = ?", (attempts, lockout_until, user['id']))

    @staticmethod
    def reset_failed_login(user_id: int):
        Database.execute_write("UPDATE users SET failed_login_attempts = 0, lockout_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = ?", (user_id,))

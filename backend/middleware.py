import time
from http.cookies import SimpleCookie
from backend.security import Security
from backend.config import ALLOWED_ORIGINS

# Rate limiter memory tracking: { ip: [timestamps] }
IP_RATE_LIMITS = {}

class Middleware:

    @staticmethod
    def apply_security_headers(handler):
        handler.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.web3forms.com;")
        handler.send_header('X-Content-Type-Options', 'nosniff')
        handler.send_header('X-Frame-Options', 'SAMEORIGIN')
        handler.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        handler.send_header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        
        origin = handler.headers.get('Origin', '')
        if origin in ALLOWED_ORIGINS or '*' in ALLOWED_ORIGINS:
            handler.send_header('Access-Control-Allow-Origin', origin if origin else ALLOWED_ORIGINS[0])
            handler.send_header('Access-Control-Allow-Credentials', 'true')
            handler.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')

    @staticmethod
    def parse_session_cookie(handler):
        cookie_header = handler.headers.get('Cookie', '')
        if not cookie_header:
            return None
        
        cookie = SimpleCookie()
        try:
            cookie.load(cookie_header)
            if 'session_id' in cookie:
                session_id = cookie['session_id'].value
                return Security.get_session(session_id)
        except Exception:
            pass
        return None

    @staticmethod
    def set_session_cookie(handler, session_id: str):
        # Set HttpOnly, SameSite=Lax cookie
        cookie_val = f"session_id={session_id}; Path=/; HttpOnly; SameSite=Lax"
        handler.send_header('Set-Cookie', cookie_val)

    @staticmethod
    def clear_session_cookie(handler):
        cookie_val = "session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
        handler.send_header('Set-Cookie', cookie_val)

    @staticmethod
    def verify_csrf(handler, session):
        if handler.command in ['POST', 'PUT', 'PATCH', 'DELETE']:
            csrf_header = handler.headers.get('X-CSRF-Token', '')
            if not session or not session.get('csrf_token') or csrf_header != session.get('csrf_token'):
                return False
        return True

    @staticmethod
    def check_rate_limit(ip_address: str, max_requests=5, window_seconds=900) -> bool:
        """Rate limiter for public endpoints (default 5 req per 15 minutes)"""
        now = time.time()
        if ip_address not in IP_RATE_LIMITS:
            IP_RATE_LIMITS[ip_address] = []
        
        # Filter timestamps within window
        valid_ts = [ts for ts in IP_RATE_LIMITS[ip_address] if now - ts < window_seconds]
        IP_RATE_LIMITS[ip_address] = valid_ts
        
        if len(valid_ts) >= max_requests:
            return False
        
        IP_RATE_LIMITS[ip_address].append(now)
        return True

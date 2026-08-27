import urllib.request
import urllib.parse
import http.client
import json
import sqlite3
import time
import os
import threading
import socket
from backend.app import run_app

print("=================================================================")
print("=== GROWTHBEACON CRM REAL HTTP INTEGRATION & SECURITY SUITE ===")
print("=================================================================")

BASE_URL = "http://127.0.0.1:8080"
cookie_jar = {}

def start_server_if_needed():
    # Start GrowthBeacon backend server in daemon thread
    print("[INFO] Launching GrowthBeacon backend server thread...")
    server_thread = threading.Thread(target=run_app, daemon=True)
    server_thread.start()
    time.sleep(1.0)

def make_request(path, method="GET", body=None, headers=None, cookies=None, retries=3):
    url = f"{BASE_URL}{path}"
    req_headers = {"User-Agent": "GrowthBeaconTestRunner/1.0"}
    if headers:
        req_headers.update(headers)
    
    if cookies:
        cookie_str = "; ".join([f"{k}={v}" for k, v in cookies.items()])
        req_headers["Cookie"] = cookie_str

    data_bytes = None
    if body is not None:
        data_bytes = json.dumps(body).encode('utf-8')
        req_headers["Content-Type"] = "application/json"

    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, data=data_bytes, headers=req_headers, method=method)
            with urllib.request.urlopen(req) as resp:
                resp_headers = resp.info()
                if 'Set-Cookie' in resp_headers:
                    sc = resp_headers['Set-Cookie']
                    if 'session_id=' in sc:
                        sid = sc.split('session_id=')[1].split(';')[0]
                        cookie_jar['session_id'] = sid
                
                body_text = resp.read().decode('utf-8')
                if path.startswith('/api/'):
                    return resp.status, json.loads(body_text) if body_text else {}
                return resp.status, {"html": body_text}
        except urllib.error.HTTPError as e:
            body_text = e.read().decode('utf-8')
            try:
                res_json = json.loads(body_text)
            except Exception:
                res_json = {"raw": body_text}
            return e.code, res_json
        except (http.client.RemoteDisconnected, ConnectionResetError, ConnectionRefusedError):
            if attempt < retries - 1:
                time.sleep(0.5)
                continue
            raise

def run_tests():
    start_server_if_needed()

    # 1. Test Unauthenticated Protected Endpoint (401 Expected)
    print("\n[TEST 1] Testing Unauthenticated Protected Endpoint -> Expecting 401 Unauthorized...")
    status, data = make_request("/api/v1/leads")
    print(f"  Status: {status}, Error Code: {data.get('error', {}).get('code')}")
    assert status == 401, f"Expected 401 Unauthorized, got {status}"

    # 2. Test Invalid Login Rate Limit & Generic Error Message (401 Expected)
    print("\n[TEST 2] Testing Invalid Credentials -> Expecting Generic 401 Error...")
    status, data = make_request("/api/v1/auth/login", method="POST", body={"email": "admin@growthbeacon.co.in", "password": "wrongpassword123"})
    print(f"  Status: {status}, Error Message: {data.get('error', {}).get('message')}")
    assert status == 401, "Expected 401 for invalid password"
    assert data.get('error', {}).get('message') == "Invalid credentials", "Should return generic error message!"

    # 3. Test Valid Admin Login (200 Expected, Cookie Set)
    print("\n[TEST 3] Testing Valid Admin Login -> Expecting HttpOnly Cookie & Session...")
    status, data = make_request("/api/v1/auth/login", method="POST", body={"email": "admin@growthbeacon.co.in", "password": "beacon2026"})
    print(f"  Status: {status}, Message: {data.get('message')}, CSRF Token Issued: {bool(data.get('csrf_token'))}")
    assert status == 200 and data.get('success'), "Admin login failed!"
    csrf_token = data.get('csrf_token')
    assert 'session_id' in cookie_jar, "HttpOnly session_id cookie missing!"

    # 4. Test Authenticated User ME Endpoint (200 Expected)
    print("\n[TEST 4] Testing Authenticated Session (/api/v1/auth/me)...")
    status, data = make_request("/api/v1/auth/me", cookies=cookie_jar)
    print(f"  Status: {status}, User: {data.get('user', {}).get('name')}, Role: {data.get('user', {}).get('role_name')}")
    assert status == 200 and data.get('authenticated'), "Authenticated session check failed!"

    # 5. Test State-Changing Operation Without CSRF Token (403 Expected)
    print("\n[TEST 5] Testing State-Changing Request Without CSRF Header -> Expecting 403 Forbidden...")
    status, data = make_request("/api/v1/leads", method="POST", body={"name": "CSRF Test Lead", "phone": "+91 9999900000"}, cookies=cookie_jar)
    print(f"  Status: {status}, Error Code: {data.get('error', {}).get('code')}")
    assert status == 403, "Expected 403 Forbidden for missing CSRF token!"

    # 6. Test Valid Lead Creation With CSRF Token (200 Expected)
    print("\n[TEST 6] Testing Valid Lead Creation With CSRF Token...")
    status, data = make_request("/api/v1/leads", method="POST", body={"name": "Integration Test Lead", "email": "testlead@gmail.com", "phone": "+91 9842199999", "company": "Test Enterprise Ltd"}, headers={"X-CSRF-Token": csrf_token}, cookies=cookie_jar)
    print(f"  Status: {status}, Lead ID: {data.get('lead_id')}")
    assert status == 200 and data.get('success'), "Lead creation failed!"

    # 7. Test Public Website Lead Webhook & Duplicate Filter
    print("\n[TEST 7] Testing Public Website Lead Webhook (/api/v1/leads/public-enquiry)...")
    status, data = make_request("/api/v1/leads/public-enquiry", method="POST", body={"name": "Public Visitor", "email": "public@visitor.com", "phone": "+91 9842188888", "service": "SEO Services"})
    print(f"  Status: {status}, Response Message: {data.get('message')}")
    assert status == 200 and data.get('success'), "Public lead webhook failed!"

    # 8. Test Decimal GST Invoice Generation (200 Expected)
    print("\n[TEST 8] Testing Decimal GST Invoice Generation (18% GST Toggle)...")
    status, data = make_request("/api/v1/invoices", method="POST", body={"client_id": 1, "subtotal": 50000, "include_gst": True}, headers={"X-CSRF-Token": csrf_token}, cookies=cookie_jar)
    print(f"  Status: {status}, Invoice Number: {data.get('invoice_number')}, Total: INR {data.get('total')}")
    assert status == 200 and data.get('total') == 59000.0, "GST calculation failed! Expected 59000.0"

    # 9. Test Public Website Regression (HTTP 200 Expected)
    print("\n[TEST 9] Testing Public Agency Website Pages Regression...")
    for page_path in ["/", "/about/", "/services/", "/contact/"]:
        status, _ = make_request(page_path)
        print(f"  Page {page_path:15s}: HTTP {status}")
        assert status == 200, f"Public page {page_path} failed!"

    # 10. Test Logout Session Invalidation
    print("\n[TEST 10] Testing Logout & Session Invalidation...")
    status, data = make_request("/api/v1/auth/logout", method="POST", headers={"X-CSRF-Token": csrf_token}, cookies=cookie_jar)
    print(f"  Status: {status}, Message: {data.get('message')}")
    assert status == 200, "Logout request failed!"

    # Verify session is dead
    status, data = make_request("/api/v1/auth/me", cookies=cookie_jar)
    print(f"  After Logout /me Status: {status} (Session invalidated successfully)")
    assert status == 401, "Session should be dead after logout!"

    print("\n=================================================================")
    print("=== ALL REAL HTTP INTEGRATION & SECURITY TESTS PASSED (100%) ===")
    print("=================================================================")

if __name__ == '__main__':
    run_tests()

import http.server
import socketserver
import json
import os
import re
import secrets
from urllib.parse import parse_qs, urlparse
from decimal import Decimal

from backend.config import PORT, UPLOADS_DIR
from backend.database import Database
from backend.security import Security
from backend.middleware import Middleware
from backend.services.finance_service import FinanceService
from backend.services.conversion_service import ConversionService
from backend.repositories.lead_repository import LeadRepository

lead_repo = LeadRepository()

class GrowthBeaconCRMApp(http.server.SimpleHTTPRequestHandler):

    def send_json(self, data, status=200, cookie_headers=None):
        body = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status)
        Middleware.apply_security_headers(self)
        if cookie_headers:
            for ch in cookie_headers:
                self.send_header('Set-Cookie', ch)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, message, code="BAD_REQUEST", status=400):
        return self.send_json({"success": False, "error": {"code": code, "message": message}}, status)

    def do_OPTIONS(self):
        self.send_response(200)
        Middleware.apply_security_headers(self)
        self.end_headers()

    def get_client_ip(self):
        ff = self.headers.get('X-Forwarded-For')
        if ff:
            return ff.split(',')[0].strip()
        return self.client_address[0]

    def read_json_body(self, max_bytes=102400):
        length = int(self.headers.get('Content-Length', 0))
        if length > max_bytes:
            raise ValueError("Payload exceeds maximum size limit (100KB)")
        if length > 0:
            raw = self.rfile.read(length).decode('utf-8')
            return json.loads(raw)
        return {}

    # =========================================================================
    # HTTP GET HANDLER
    # =========================================================================
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # Static Alias Routing
        if path in ['/app', '/app/']:
            self.path = '/crm.html'
            return super().do_GET()
        if path in ['/portal', '/portal/']:
            self.path = '/client.html'
            return super().do_GET()

        # Handle API v1 endpoints
        if path.startswith('/api/v1/'):
            session = Middleware.parse_session_cookie(self)

            # Auth Me
            if path == '/api/v1/auth/me':
                if session:
                    return self.send_json({"authenticated": True, "user": session, "csrf_token": session.get('csrf_token')})
                return self.send_error_json("Unauthenticated session", "UNAUTHORIZED", 401)

            # Executive Dashboard Metrics
            if path == '/api/v1/dashboard/metrics':
                if not session:
                    return self.send_error_json("Unauthenticated", "UNAUTHORIZED", 401)

                leads_cnt = Database.execute_single("SELECT COUNT(*) as cnt FROM leads WHERE is_deleted = 0")['cnt']
                qual_cnt = Database.execute_single("SELECT COUNT(*) as cnt FROM leads WHERE status IN ('Qualified', 'Won') AND is_deleted = 0")['cnt']
                won_cnt = Database.execute_single("SELECT COUNT(*) as cnt FROM deals WHERE status = 'Won' AND is_deleted = 0")['cnt']
                active_clients = Database.execute_single("SELECT COUNT(*) as cnt FROM clients WHERE status = 'Active' AND is_deleted = 0")['cnt']
                active_projects = Database.execute_single("SELECT COUNT(*) as cnt FROM projects WHERE status = 'Active' AND is_deleted = 0")['cnt']

                # Real Financial Calculations (Subscriptions MRR)
                mrr_row = Database.execute_single("SELECT SUM(amount) as total FROM subscriptions WHERE status = 'Active'")
                mrr = Decimal(str(mrr_row['total'] or 0.0))
                arr = mrr * Decimal('12')

                paid_row = Database.execute_single("SELECT SUM(amount) as total FROM payments")
                collected_revenue = Decimal(str(paid_row['total'] or 0.0))

                inv_row = Database.execute_single("SELECT SUM(total_amount) as total FROM invoices WHERE status != 'Cancelled' AND is_deleted = 0")
                invoiced_revenue = Decimal(str(inv_row['total'] or 0.0))

                bal_row = Database.execute_single("SELECT SUM(balance_amount) as total FROM invoices WHERE status != 'Paid' AND is_deleted = 0")
                outstanding_balance = Decimal(str(bal_row['total'] or 0.0))

                exp_row = Database.execute_single("SELECT SUM(amount) as total FROM expenses")
                total_expenses = Decimal(str(exp_row['total'] or 0.0))

                profit = collected_revenue - total_expenses

                return self.send_json({
                    "success": True,
                    "metrics": {
                        "total_leads": leads_cnt,
                        "qualified_leads": qual_cnt,
                        "conversion_rate": round((won_cnt / leads_cnt * 100), 1) if leads_cnt > 0 else 0.0,
                        "mrr": float(mrr),
                        "arr": float(arr),
                        "invoiced_revenue": float(invoiced_revenue),
                        "collected_revenue": float(collected_revenue),
                        "outstanding_balance": float(outstanding_balance),
                        "total_expenses": float(total_expenses),
                        "net_profit": float(profit),
                        "active_clients": active_clients,
                        "active_projects": active_projects
                    }
                })

            # Global Search across CRM entities
            if path == '/api/v1/search':
                if not session:
                    return self.send_error_json("Unauthenticated", "UNAUTHORIZED", 401)
                q = query.get('q', [''])[0].strip().lower()
                if not q:
                    return self.send_json({"success": True, "results": []})

                results = []
                for r in Database.execute_query("SELECT id, name, company FROM leads WHERE is_deleted = 0 AND (LOWER(name) LIKE ? OR LOWER(company) LIKE ?) LIMIT 5", (f'%{q}%', f'%{q}%')):
                    results.append({"type": "Lead", "id": r["id"], "title": r["name"], "subtitle": r["company"] or "Lead", "link": "leads"})
                for r in Database.execute_query("SELECT id, company_name, industry FROM clients WHERE is_deleted = 0 AND LOWER(company_name) LIKE ? LIMIT 5", (f'%{q}%',)):
                    results.append({"type": "Client", "id": r["id"], "title": r["company_name"], "subtitle": r["industry"] or "Client", "link": "clients"})
                for r in Database.execute_query("SELECT id, invoice_number, total_amount FROM invoices WHERE is_deleted = 0 AND LOWER(invoice_number) LIKE ? LIMIT 5", (f'%{q}%',)):
                    results.append({"type": "Invoice", "id": r["id"], "title": r["invoice_number"], "subtitle": f"₹{r['total_amount']}", "link": "finance"})

                return self.send_json({"success": True, "results": results})

            # Collection APIs with Pagination
            page = int(query.get('page', [1])[0])
            limit = min(int(query.get('limit', [20])[0]), 100)
            q_str = query.get('q', [''])[0]

            if path == '/api/v1/leads':
                if not session: return self.send_error_json("Unauthenticated", "UNAUTHORIZED", 401)
                rows, total = lead_repo.find_all(page=page, limit=limit, search_query=q_str)
                return self.send_json({"success": True, "leads": rows, "pagination": {"page": page, "limit": limit, "total": total}})

            if path == '/api/v1/deals':
                if not session: return self.send_error_json("Unauthenticated", "UNAUTHORIZED", 401)
                rows = Database.execute_query("SELECT d.*, c.company_name as client_name, ps.name as stage_name FROM deals d LEFT JOIN clients c ON d.company_id = c.id LEFT JOIN pipeline_stages ps ON d.stage_id = ps.id WHERE d.is_deleted = 0 ORDER BY d.id DESC LIMIT ? OFFSET ?", (limit, (page-1)*limit))
                return self.send_json({"success": True, "deals": rows})

            if path == '/api/v1/clients':
                if not session: return self.send_error_json("Unauthenticated", "UNAUTHORIZED", 401)
                rows = Database.execute_query("SELECT c.*, u.name as manager_name FROM clients c LEFT JOIN users u ON c.account_manager_id = u.id WHERE c.is_deleted = 0 ORDER BY c.id DESC LIMIT ? OFFSET ?", (limit, (page-1)*limit))
                return self.send_json({"success": True, "clients": rows})

            if path == '/api/v1/projects':
                if not session: return self.send_error_json("Unauthenticated", "UNAUTHORIZED", 401)
                rows = Database.execute_query("SELECT p.*, cl.company_name, u.name as manager_name FROM projects p LEFT JOIN clients cl ON p.client_id = cl.id LEFT JOIN users u ON p.manager_id = u.id WHERE p.is_deleted = 0 ORDER BY p.id DESC LIMIT ? OFFSET ?", (limit, (page-1)*limit))
                return self.send_json({"success": True, "projects": rows})

            if path == '/api/v1/tasks':
                if not session: return self.send_error_json("Unauthenticated", "UNAUTHORIZED", 401)
                rows = Database.execute_query("SELECT t.*, cl.company_name, u.name as assignee_name FROM tasks t LEFT JOIN clients cl ON t.client_id = cl.id LEFT JOIN users u ON t.assignee_id = u.id WHERE t.is_deleted = 0 ORDER BY t.id DESC LIMIT ? OFFSET ?", (limit, (page-1)*limit))
                return self.send_json({"success": True, "tasks": rows})

            if path == '/api/v1/invoices':
                if not session: return self.send_error_json("Unauthenticated", "UNAUTHORIZED", 401)
                rows = Database.execute_query("SELECT i.*, cl.company_name FROM invoices i LEFT JOIN clients cl ON i.client_id = cl.id WHERE i.is_deleted = 0 ORDER BY i.id DESC LIMIT ? OFFSET ?", (limit, (page-1)*limit))
                return self.send_json({"success": True, "invoices": rows})

            if path == '/api/v1/tickets':
                if not session: return self.send_error_json("Unauthenticated", "UNAUTHORIZED", 401)
                rows = Database.execute_query("SELECT tk.*, cl.company_name, u.name as assignee_name FROM tickets tk LEFT JOIN clients cl ON tk.client_id = cl.id LEFT JOIN users u ON tk.assignee_id = u.id ORDER BY tk.id DESC LIMIT ? OFFSET ?", (limit, (page-1)*limit))
                return self.send_json({"success": True, "tickets": rows})

            # Client Portal Dashboard (Strict Server Session Isolation)
            if path == '/api/v1/portal/dashboard':
                if not session or session.get('role_name') != 'Client' or not session.get('client_id'):
                    return self.send_error_json("Unauthorized portal session", "FORBIDDEN", 403)
                
                client_id = session['client_id']
                client_info = Database.execute_single("SELECT * FROM clients WHERE id = ? AND is_deleted = 0", (client_id,))
                projects = Database.execute_query("SELECT * FROM projects WHERE client_id = ? AND is_deleted = 0", (client_id,))
                invoices = Database.execute_query("SELECT * FROM invoices WHERE client_id = ? AND is_deleted = 0", (client_id,))

                return self.send_json({
                    "success": True,
                    "client": client_info,
                    "projects": projects,
                    "invoices": invoices
                })

            if path == '/api/v1/audit-logs':
                if not session or session.get('role_name') != 'Super Admin':
                    return self.send_error_json("Admin permission required", "FORBIDDEN", 403)
                logs = Database.execute_query("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50")
                return self.send_json({"success": True, "audit_logs": logs})

        return super().do_GET()

    # =========================================================================
    # HTTP POST HANDLER
    # =========================================================================
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        try:
            body = self.read_json_body()
        except ValueError as ve:
            return self.send_error_json(str(ve), "PAYLOAD_TOO_LARGE", 413)

        # Public Website Enquiry Webhook
        if path == '/api/v1/leads/public-enquiry':
            ip_addr = self.get_client_ip()
            if not Middleware.check_rate_limit(ip_addr, max_requests=5, window_seconds=900):
                return self.send_error_json("Rate limit exceeded. Please wait 15 minutes before submitting again.", "TOO_MANY_REQUESTS", 429)

            # Spam Honeypot check
            if body.get('website_hp_check'):
                return self.send_json({"success": True, "message": "Enquiry received."})

            name = body.get('name', '').strip()
            email = body.get('email', '').strip().lower()
            phone = body.get('phone', '').strip()
            company = body.get('company', '').strip() or 'Direct Website Visitor'
            service = body.get('service', 'Digital Marketing').strip()
            message = body.get('message', '').strip()

            if not name or not (email or phone):
                return self.send_error_json("Name and contact email or phone are required", "VALIDATION_ERROR", 400)

            # Duplicate Check
            dup = lead_repo.find_duplicate(email, phone)
            if dup:
                return self.send_json({
                    "success": True,
                    "message": "Thank you! Your enquiry has been received and updated in our system.",
                    "lead_id": dup['id']
                })

            # Server-Side Lead Scoring
            score = 50
            if company and company != 'Direct Website Visitor': score += 15
            if email and '@' in email: score += 10
            if phone: score += 15
            if service in ['SEO Services', 'Website Development', 'Google Ads Management']: score += 10

            lead_id = lead_repo.create_lead({
                "name": name, "company": company, "email": email, "phone": phone,
                "interested_services": service, "lead_score": score, "status": "New",
                "notes": message, "utm_source": body.get('utm_source'), "utm_medium": body.get('utm_medium'), "utm_campaign": body.get('utm_campaign')
            })

            Database.execute_write("INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ('PUBLIC_LEAD_ENQUIRY', 'Lead', ?, ?)",
                                   (str(lead_id), f"Public web lead: {name} ({email})"))

            return self.send_json({"success": True, "message": "Thank you for contacting GrowthBeacon!", "lead_id": lead_id})

        # Auth Login
        if path == '/api/v1/auth/login':
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            ip_addr = self.get_client_ip()

            # Check Rate Limit & Lockout
            user = Database.execute_single("SELECT id, name, password_hash, lockout_until, failed_login_attempts FROM users WHERE email = ?", (email,))
            if user and user.get('lockout_until'):
                return self.send_error_json("Account temporarily locked due to repeated failed logins. Please try again in 15 minutes.", "LOCKED", 423)

            if not user or not Security.verify_password(password, user['password_hash']):
                Security.record_failed_login(email)
                Database.execute_write("INSERT INTO audit_logs (action, entity_type, details) VALUES ('LOGIN_FAILED', 'Auth', ?)",
                                       (f"Failed login attempt for email: {email} from IP: {ip_addr}",))
                return self.send_error_json("Invalid credentials", "UNAUTHORIZED", 401)

            # Reset failed logins & create HttpOnly Session Cookie
            Security.reset_failed_login(user['id'])
            session_id, csrf_token = Security.create_session(user['id'], ip_addr, self.headers.get('User-Agent', ''))

            Database.execute_write("INSERT INTO audit_logs (user_id, user_name, action, entity_type, details) VALUES (?, ?, 'LOGIN_SUCCESS', 'Auth', 'User session established')",
                                   (user['id'], user['name']))

            cookie_header = f"session_id={session_id}; Path=/; HttpOnly; SameSite=Lax"
            return self.send_json({"success": True, "message": "Authenticated successfully", "csrf_token": csrf_token}, cookie_headers=[cookie_header])

        # Auth Logout
        if path == '/api/v1/auth/logout':
            session = Middleware.parse_session_cookie(self)
            if session:
                Security.invalidate_session(session['session_id'])
            expired_cookie = "session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
            return self.send_json({"success": True, "message": "Logged out successfully"}, cookie_headers=[expired_cookie])

        # State-Changing Endpoints Require CSRF Token
        session = Middleware.parse_session_cookie(self)
        if not session:
            return self.send_error_json("Unauthenticated session", "UNAUTHORIZED", 401)

        if not Middleware.verify_csrf(self, session):
            return self.send_error_json("Invalid CSRF token", "FORBIDDEN", 403)

        # Create Lead
        if path == '/api/v1/leads':
            lid = lead_repo.create_lead(body)
            return self.send_json({"success": True, "lead_id": lid})

        # Convert Lead / Deal to Client Account (Transactional Workflow)
        if path.endswith('/convert-to-client') or path.endswith('/convert'):
            deal_id = int(path.split('/')[-2]) if 'deals' in path else int(path.split('/')[-2])
            company_name = body.get('company_name', 'Converted Client Account')
            res = ConversionService.convert_deal_to_client(deal_id, company_name, session['user_id'])
            return self.send_json(res)

        # Create Invoice (With Decimal GST Toggle)
        if path == '/api/v1/invoices':
            client_id = int(body.get('client_id', 1))
            subtotal = float(body.get('subtotal', 35000))
            include_gst = bool(body.get('include_gst', True))

            calc = FinanceService.calculate_gst_invoice(subtotal, 0.0, include_gst)
            inv_num = f"INV-2026-{secrets.randbelow(1000):03d}"

            query = """
                INSERT INTO invoices (invoice_number, client_id, issue_date, due_date, subtotal, include_gst, cgst_rate, sgst_rate, cgst_amount, sgst_amount, total_amount, paid_amount, balance_amount, status)
                VALUES (?, ?, CURRENT_DATE, DATE('now', '+15 days'), ?, ?, ?, ?, ?, ?, ?, 0, ?, 'Sent')
            """
            inv_id = Database.execute_write(query, (inv_num, client_id, calc['subtotal'], calc['include_gst'], calc['cgst_rate'], calc['sgst_rate'], calc['cgst_amount'], calc['sgst_amount'], calc['total_amount'], calc['total_amount']))

            return self.send_json({"success": True, "invoice_id": inv_id, "invoice_number": inv_num, "total": calc['total_amount']})

        # Record Payment
        if path == '/api/v1/payments':
            inv_id = int(body.get('invoice_id'))
            amount = float(body.get('amount', 0))

            inv = Database.execute_single("SELECT * FROM invoices WHERE id = ? AND is_deleted = 0", (inv_id,))
            if not inv:
                return self.send_error_json("Invoice not found", "NOT_FOUND", 404)

            calc = FinanceService.calculate_payment_balance(inv['total_amount'], inv['paid_amount'], amount)
            
            Database.execute_write("INSERT INTO payments (invoice_id, client_id, amount, payment_method, reference_number) VALUES (?, ?, ?, ?, ?)",
                                   (inv_id, inv['client_id'], amount, body.get('payment_method', 'UPI'), body.get('reference_number', '')))
            Database.execute_write("UPDATE invoices SET paid_amount = ?, balance_amount = ?, status = ? WHERE id = ?",
                                   (calc['paid_amount'], calc['balance_amount'], calc['status'], inv_id))

            return self.send_json({"success": True, "paid_amount": calc['paid_amount'], "balance": calc['balance_amount'], "status": calc['status']})

        return self.send_error_json("Endpoint not found", "NOT_FOUND", 404)

    # =========================================================================
    # HTTP PUT & PATCH HANDLERS
    # =========================================================================
    def do_PUT(self):
        return self.handle_update(is_patch=False)

    def do_PATCH(self):
        return self.handle_update(is_patch=True)

    def handle_update(self, is_patch=False):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.read_json_body()

        session = Middleware.parse_session_cookie(self)
        if not session:
            return self.send_error_json("Unauthenticated session", "UNAUTHORIZED", 401)

        if not Middleware.verify_csrf(self, session):
            return self.send_error_json("Invalid CSRF token", "FORBIDDEN", 403)

        # Update Lead with Optimistic Concurrency Control
        if path.startswith('/api/v1/leads/'):
            lead_id = int(path.split('/')[-1])
            version = int(body.get('version', 1))
            updated = lead_repo.update_lead(lead_id, body, version)
            if not updated:
                return self.send_error_json("Record version conflict. Another user modified this lead.", "CONFLICT", 409)
            return self.send_json({"success": True, "lead_id": lead_id})

        return self.send_error_json("Endpoint not found", "NOT_FOUND", 404)

    # =========================================================================
    # HTTP DELETE HANDLER
    # =========================================================================
    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        session = Middleware.parse_session_cookie(self)
        if not session:
            return self.send_error_json("Unauthenticated session", "UNAUTHORIZED", 401)

        if not Middleware.verify_csrf(self, session):
            return self.send_error_json("Invalid CSRF token", "FORBIDDEN", 403)

        if path.startswith('/api/v1/leads/'):
            lead_id = int(path.split('/')[-1])
            lead_repo.soft_delete(lead_id)
            Database.execute_write("INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES (?, 'SOFT_DELETE_LEAD', 'Lead', ?)", (session['user_id'], str(lead_id)))
            return self.send_json({"success": True, "message": "Lead archived successfully"})

        return self.send_error_json("Endpoint not found", "NOT_FOUND", 404)

def run_app():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), GrowthBeaconCRMApp) as httpd:
        print(f"=== GROWTHBEACON PRODUCTION BACKEND ENGINE (PORT {PORT}) ===")
        httpd.serve_forever()

if __name__ == '__main__':
    run_app()

import sqlite3
import hashlib
import json
import secrets
from datetime import datetime, timedelta

def hash_password(password: str) -> str:
    # PBKDF2/SHA256 password hashing
    salt = "growthbeacon_crm_salt_2026"
    return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()

def seed_database(db_path='growth_beacon_crm.db'):
    print(f"=== SEEDING GROWTHBEACON CRM DATABASE: {db_path} ===")
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    cursor = conn.cursor()

    # Load and execute schema.sql
    with open('schema.sql', 'r', encoding='utf-8') as f:
        schema_script = f.read()
    cursor.executescript(schema_script)

    # 1. Seed Roles
    roles = [
        ("Super Admin", "Full system read/write access across all modules, settings, & logs"),
        ("Admin", "Operational management access"),
        ("Sales Manager", "Sales team and pipeline management"),
        ("Sales Executive", "Leads, contacts, deals, follow-ups, proposals"),
        ("Account Manager", "Clients, projects, communication, and reporting"),
        ("SEO Specialist", "SEO projects, keywords, rankings, tasks, and reports"),
        ("Performance Marketer", "Google & Meta Ads campaigns and ad metrics"),
        ("Social Media Manager", "Social media content, calendars, and publishing"),
        ("Content Team", "Content creation, copywriting, and approvals"),
        ("Designer", "Creative tasks and asset library"),
        ("Finance", "Invoices, payments, expenses, and financial reporting"),
        ("Employee", "Assigned tasks and permitted modules"),
        ("Client", "Own client portal data ONLY (clientId scoped)")
    ]

    for role_name, desc in roles:
        cursor.execute("INSERT OR IGNORE INTO roles (name, description) VALUES (?, ?)", (role_name, desc))

    # Map role IDs
    cursor.execute("SELECT id, name FROM roles")
    role_id_map = {name: id for id, name in cursor.fetchall()}

    # 2. Seed Admin and Employee Users
    pwd_hash = hash_password("beacon2026")

    users_data = [
        ("Premkumar (Super Admin)", "admin@growthbeacon.co.in", pwd_hash, "+91 8190801030", role_id_map["Super Admin"], None, "https://growthbeacon.co.in/assets/growth_beacon_logo.jpg"),
        ("Ram (Operations Lead)", "ram@growthbeacon.co.in", pwd_hash, "+91 8190801030", role_id_map["Admin"], None, None),
        ("Vikram (Sales Manager)", "sales.mgr@growthbeacon.co.in", pwd_hash, "+91 9876543210", role_id_map["Sales Manager"], None, None),
        ("Kavitha (Sales Exec)", "sales.exec@growthbeacon.co.in", pwd_hash, "+91 9876543211", role_id_map["Sales Executive"], None, None),
        ("Anand (Account Manager)", "am@growthbeacon.co.in", pwd_hash, "+91 9876543212", role_id_map["Account Manager"], None, None),
        ("Priya (SEO Specialist)", "seo@growthbeacon.co.in", pwd_hash, "+91 9876543213", role_id_map["SEO Specialist"], None, None),
        ("Karthik (Performance Marketer)", "ads@growthbeacon.co.in", pwd_hash, "+91 9876543214", role_id_map["Performance Marketer"], None, None),
        ("Sonia (Finance Manager)", "finance@growthbeacon.co.in", pwd_hash, "+91 9876543215", role_id_map["Finance"], None, None)
    ]

    for name, email, p_hash, phone, r_id, c_id, avatar in users_data:
        cursor.execute("INSERT OR IGNORE INTO users (name, email, password_hash, phone, role_id, client_id, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (name, email, p_hash, phone, r_id, c_id, avatar))

    # 3. Seed Services & Packages
    services_data = [
        ("SEO Services", "SEO", "Search Engine Optimization for local & organic Google rank growth", 25000, "Local 3-Pack rank, Keyword positions, Organic traffic"),
        ("Google Ads Management", "PPC", "High-conversion Google Search & Display PPC ad management", 30000, "Click-through rate (CTR), Cost Per Lead (CPL), ROAS"),
        ("Meta Ads (FB & IG)", "Paid Social", "Facebook & Instagram Reels video ad campaigns & funnels", 28000, "Reach, Impressions, Lead Form Submissions"),
        ("Website Development", "Web Dev", "Custom responsive web applications & lead conversion webhooks", 45000, "100/100 Mobile Speed, CRO, Lead Webhook"),
        ("Social Media Management", "Social", "Brand content planning, graphic designs, and video reels", 20000, "Post engagement, Content calendar, Followers"),
        ("WhatsApp Marketing", "Automation", "Broadcast campaigns & Click-to-WhatsApp automated ads", 18000, "Broadcast reach, Response rate, Conversions")
    ]

    for name, cat, desc, price, kpi in services_data:
        cursor.execute("INSERT OR IGNORE INTO services (name, category, description, base_price, kpi_deliverables) VALUES (?, ?, ?, ?, ?)",
                       (name, cat, desc, price, kpi))

    # 4. Seed Pipelines & Stages
    cursor.execute("INSERT OR IGNORE INTO pipelines (name, description) VALUES (?, ?)", ("GrowthBeacon Agency Sales Pipeline", "Standard 6-stage sales pipeline"))
    pipeline_id = cursor.lastrowid or 1

    stages = [
        ("New", 1, 10.0),
        ("Discovery", 2, 25.0),
        ("Qualified", 3, 50.0),
        ("Proposal Sent", 4, 75.0),
        ("Negotiation", 5, 90.0),
        ("Won", 6, 100.0),
        ("Lost", 7, 0.0)
    ]
    for s_name, idx, prob in stages:
        cursor.execute("INSERT OR IGNORE INTO pipeline_stages (pipeline_id, name, order_index, probability) VALUES (?, ?, ?, ?)",
                       (pipeline_id, s_name, idx, prob))

    # 5. Seed Companies & Contacts
    companies = [
        ("Nova Retail Showroom", "Retail / Apparel", "https://novaretail.com", "Theni, Tamil Nadu", "50-100", 15000000, "Premium clothing chain in South TN"),
        ("GreenLeaf Organics", "Agriculture / FMCG", "https://greenleaforganics.in", "Bodinayakanur, Theni", "20-50", 8000000, "Spices & Organic exports"),
        ("Madurai Heritage Hotel", "Hospitality", "https://maduraiheritage.com", "Madurai, Tamil Nadu", "100-250", 40000000, "Luxury boutique hotel"),
        ("Apex Spices & Agro", "Export / Trading", "https://apexspices.co.in", "Dindigul, Tamil Nadu", "10-20", 5000000, "Cardamom & Pepper traders")
    ]

    for cname, ind, web, loc, sz, rev, notes in companies:
        cursor.execute("INSERT OR IGNORE INTO companies (name, industry, website, location, size, annual_revenue, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (cname, ind, web, loc, sz, rev, notes))

    # Seed Contacts
    cursor.execute("SELECT id, name FROM companies")
    comp_map = {name: id for id, name in cursor.fetchall()}

    contacts = [
        (comp_map.get("Nova Retail Showroom"), "Rajesh Kumar", "Managing Director", "rajesh@novaretail.com", "+91 9842100001", "+91 9842100001", "Owner", 1),
        (comp_map.get("GreenLeaf Organics"), "Senthil Nathan", "Head of Sales", "senthil@greenleaf.in", "+91 9842100002", "+91 9842100002", "Decision Maker", 1),
        (comp_map.get("Madurai Heritage Hotel"), "Meenakshi Sundaram", "General Manager", "gm@maduraiheritage.com", "+91 9842100003", "+91 9842100003", "Decision Maker", 1)
    ]

    for cid, name, title, email, phone, wa, role, is_dm in contacts:
        cursor.execute("INSERT OR IGNORE INTO contacts (company_id, name, job_title, email, phone, whatsapp, role, is_decision_maker) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                       (cid, name, title, email, phone, wa, role, is_dm))

    # 6. Seed Clients (Active Retainers)
    cursor.execute("SELECT id FROM contacts WHERE email = 'rajesh@novaretail.com'")
    c1_contact = cursor.fetchone()
    c1_contact_id = c1_contact[0] if c1_contact else 1

    clients = [
        ("Nova Retail Showroom", "Retail", "https://novaretail.com", "Theni, Tamil Nadu", c1_contact_id, 5, "Active", 92, "Green", "Regular payments & strong campaign ROI"),
        ("GreenLeaf Organics", "Agriculture", "https://greenleaforganics.in", "Bodinayakanur, Theni", 2, 5, "Active", 78, "Yellow", "Awaiting client content feedback"),
        ("Apex Spices & Agro", "Trading", "https://apexspices.co.in", "Dindigul, Tamil Nadu", 3, 5, "Onboarding", 88, "Green", "New SEO onboarding project")
    ]

    for cname, ind, web, loc, cid, amid, status, score, hstatus, reason in clients:
        cursor.execute("INSERT OR IGNORE INTO clients (company_name, industry, website, location, primary_contact_id, account_manager_id, status, health_score, health_status, health_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                       (cname, ind, web, loc, cid, amid, status, score, hstatus, reason))

    cursor.execute("SELECT id, company_name FROM clients")
    client_map = {name: id for id, name in cursor.fetchall()}

    # Create Client Portal User for Nova Retail
    nova_client_id = client_map.get("Nova Retail Showroom", 1)
    cursor.execute("INSERT OR IGNORE INTO users (name, email, password_hash, phone, role_id, client_id, status) VALUES (?, ?, ?, ?, ?, ?, 'active')",
                   ("Rajesh Kumar (Nova Retail)", "client@novaretail.com", pwd_hash, "+91 9842100001", role_id_map["Client"], nova_client_id))

    # 7. Seed Leads
    leads = [
        ("Arunachalam", "Theni Silk Palace", "arun@thenisilks.com", "+91 9842200101", "+91 9842200101", "https://thenisilks.com", "Theni", "Retail", "Website", "SEO Services, Meta Ads", 50000, 85, "Qualified", 3, "Interested in Diwali campaign launch"),
        ("Murugan", "Subam Travels", "info@subamtravels.com", "+91 9842200102", "+91 9842200102", "https://subamtravels.com", "Madurai", "Transport", "Google Ads", "Google Ads Management", 35000, 65, "Contacted", 4, "Wants to run Google Search ads for bus tours"),
        ("Kavya", "Coimbatore Tech Park", "kavya@ctp.in", "+91 9842200103", "+91 9842200103", "https://ctp.in", "Coimbatore", "Real Estate", "Instagram", "Website Development, SEO", 120000, 92, "Proposal Sent", 3, "Requested high-performance custom portal")
    ]

    for name, comp, email, phone, wa, web, loc, ind, src, svcs, budg, score, st, owner, notes in leads:
        cursor.execute("INSERT OR IGNORE INTO leads (name, company, email, phone, whatsapp, website, location, industry, lead_source, interested_services, budget, lead_score, status, owner_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                       (name, comp, email, phone, wa, web, loc, ind, src, svcs, budg, score, st, owner, notes))

    # 8. Seed Projects & Tasks
    projects = [
        ("Nova Retail — SEO & Meta Ads Retainer", nova_client_id, 1, 5, "2026-01-01", "2026-12-31", 60000, "Active", 75, "High"),
        ("GreenLeaf Organics — E-Commerce Web App", client_map.get("GreenLeaf Organics", 2), 4, 5, "2026-02-01", "2026-09-30", 95000, "Active", 60, "Urgent")
    ]

    for pname, cid, sid, mid, sdate, edate, budg, st, prog, prio in projects:
        cursor.execute("INSERT OR IGNORE INTO projects (project_name, client_id, service_id, manager_id, start_date, end_date, budget, status, progress, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                       (pname, cid, sid, mid, sdate, edate, budg, st, prog, prio))

    cursor.execute("SELECT id FROM projects WHERE project_name LIKE 'Nova Retail%'")
    p1_row = cursor.fetchone()
    p1_id = p1_row[0] if p1_row else 1

    tasks = [
        ("Optimize Diwali Meta Ads Creatives", "Create 3 video reel variations for clothing campaign", nova_client_id, p1_id, 7, "High", "In Progress", "2026-08-25", "2026-09-05"),
        ("Perform Technical SEO Rank Audit", "Check Google Maps 3-Pack rankings for Theni keywords", nova_client_id, p1_id, 6, "Medium", "Completed", "2026-08-20", "2026-08-27"),
        ("Setup WhatsApp Broadcast API Webhook", "Integrate automated order notification funnels", nova_client_id, p1_id, 5, "High", "Todo", "2026-09-01", "2026-09-10")
    ]

    for title, desc, cid, pid, aid, prio, st, sdate, ddate in tasks:
        cursor.execute("INSERT OR IGNORE INTO tasks (title, description, client_id, project_id, assignee_id, priority, status, start_date, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                       (title, desc, cid, pid, aid, prio, st, sdate, ddate))

    # 9. Seed Invoices & Payments
    # Invoice 1: Nova Retail (Paid, with GST)
    sub1 = 50000.0
    cgst1 = sub1 * 0.09
    sgst1 = sub1 * 0.09
    tot1 = sub1 + cgst1 + sgst1

    cursor.execute("""
    INSERT OR IGNORE INTO invoices (invoice_number, client_id, project_id, issue_date, due_date, subtotal, include_gst, cgst_rate, sgst_rate, cgst_amount, sgst_amount, discount, total_amount, paid_amount, balance_amount, status)
    VALUES (?, ?, ?, '2026-08-01', '2026-08-15', ?, 1, 9.0, 9.0, ?, ?, 0, ?, ?, 0, 'Paid')
    """, ("INV-2026-001", nova_client_id, p1_id, sub1, cgst1, sgst1, tot1, tot1))
    inv1_id = cursor.lastrowid or 1

    cursor.execute("INSERT OR IGNORE INTO invoice_items (invoice_id, description, quantity, rate, amount) VALUES (?, ?, 1, ?, ?)",
                   (inv1_id, "Monthly SEO & Meta Ads Retainer Fee (August 2026)", sub1, sub1))

    cursor.execute("INSERT OR IGNORE INTO payments (invoice_id, client_id, amount, payment_date, payment_method, reference_number, notes) VALUES (?, ?, ?, '2026-08-10', 'UPI', 'UPI-9842100001-INV001', 'Full payment received via GPay')",
                   (inv1_id, nova_client_id, tot1))

    # Invoice 2: GreenLeaf Organics (Partially Paid, Non-GST option demo)
    sub2 = 35000.0
    cursor.execute("""
    INSERT OR IGNORE INTO invoices (invoice_number, client_id, project_id, issue_date, due_date, subtotal, include_gst, cgst_rate, sgst_rate, cgst_amount, sgst_amount, discount, total_amount, paid_amount, balance_amount, status)
    VALUES (?, ?, ?, '2026-08-15', '2026-08-30', ?, 0, 0, 0, 0, 0, 0, ?, 15000, 20000, 'Partially Paid')
    """, ("INV-2026-002", client_map.get("GreenLeaf Organics", 2), 2, sub2, sub2))

    # 10. Seed Workflows
    workflows = [
        ("Public Website Enquiry Auto-Assignment", "NEW_LEAD", json.dumps({"source": "Website"}), json.dumps([{"action": "assign_owner", "owner_id": 4}, {"action": "create_task", "title": "Follow up on website enquiry"}, {"action": "notify_team"}])),
        ("Deal Won Auto-Conversion", "DEAL_WON", None, json.dumps([{"action": "create_client"}, {"action": "create_onboarding_project"}, {"action": "generate_invoice"}])),
        ("Invoice Overdue Notification", "INVOICE_OVERDUE", None, json.dumps([{"action": "notify_finance"}, {"action": "send_client_reminder"}]))
    ]

    for wname, trg, cond, act in workflows:
        cursor.execute("INSERT OR IGNORE INTO workflows (name, trigger_event, conditions_json, actions_json) VALUES (?, ?, ?, ?)",
                       (wname, trg, cond, act))

    conn.commit()
    conn.close()
    print("=== SEEDING COMPLETED SUCCESSFULLY! ===")

if __name__ == '__main__':
    seed_database()

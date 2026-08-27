-- GROWTHBEACON CRM — POSTGRESQL PRODUCTION MIGRATION 001
-- Initial schema definition for Render Managed PostgreSQL Database

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (id, name, description) VALUES
(1, 'Super Admin', 'Owner & Chief Administrator'),
(2, 'Admin', 'Agency General Manager'),
(3, 'Manager', 'Account Manager / Project Lead'),
(4, 'Employee', 'Operations Specialist'),
(5, 'Client', 'Client Portal User')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id),
    client_id INT,
    failed_login_attempts INT DEFAULT 0,
    lockout_until TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    csrf_token VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
    key VARCHAR(100) PRIMARY KEY,
    request_hash VARCHAR(64) NOT NULL,
    response_body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    website VARCHAR(150),
    location VARCHAR(100),
    industry VARCHAR(50),
    lead_source VARCHAR(50) DEFAULT 'Website',
    interested_services TEXT,
    budget NUMERIC(12, 2) DEFAULT 0,
    lead_score INT DEFAULT 50,
    status VARCHAR(50) DEFAULT 'New',
    notes TEXT,
    utm_source VARCHAR(50),
    utm_medium VARCHAR(50),
    utm_campaign VARCHAR(50),
    version INT DEFAULT 1,
    is_deleted INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deals (
    id SERIAL PRIMARY KEY,
    deal_name VARCHAR(150) NOT NULL,
    company_id INT,
    value NUMERIC(12, 2) DEFAULT 0,
    stage_id INT DEFAULT 1,
    probability INT DEFAULT 50,
    status VARCHAR(50) DEFAULT 'Open',
    version INT DEFAULT 1,
    is_deleted INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(150) UNIQUE NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(150),
    location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    health_score INT DEFAULT 90,
    health_status VARCHAR(50) DEFAULT 'Green',
    version INT DEFAULT 1,
    is_deleted INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    client_id INT REFERENCES clients(id),
    manager_id INT REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'Active',
    progress INT DEFAULT 0,
    priority VARCHAR(50) DEFAULT 'High',
    version INT DEFAULT 1,
    is_deleted INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    client_id INT REFERENCES clients(id),
    project_id INT REFERENCES projects(id),
    assignee_id INT REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'Todo',
    priority VARCHAR(50) DEFAULT 'Medium',
    due_date DATE,
    version INT DEFAULT 1,
    is_deleted INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INT REFERENCES clients(id),
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    include_gst INT DEFAULT 1,
    cgst_rate NUMERIC(5, 2) DEFAULT 9.00,
    sgst_rate NUMERIC(5, 2) DEFAULT 9.00,
    cgst_amount NUMERIC(12, 2) DEFAULT 0.00,
    sgst_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    balance_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Sent',
    version INT DEFAULT 1,
    is_deleted INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES invoices(id),
    client_id INT REFERENCES clients(id),
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'UPI',
    reference_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES clients(id),
    service_name VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    billing_cycle VARCHAR(50) DEFAULT 'Monthly',
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    amount NUMERIC(12, 2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INT REFERENCES clients(id),
    subject VARCHAR(200) NOT NULL,
    priority VARCHAR(50) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Open',
    assignee_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(50),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Production Indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

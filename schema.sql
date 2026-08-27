-- GROWTHBEACON CRM — PRODUCTION RELATIONAL DATABASE SCHEMA (SQLite 3)
PRAGMA foreign_keys = ON;

-- ============================================================================
-- 1. AUTHENTICATION & SECURITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  role_id INTEGER NOT NULL,
  client_id INTEGER, -- Non-null if role is 'Client'
  avatar_url TEXT,
  status TEXT DEFAULT 'active', -- active, inactive, suspended
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, -- Token String
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  user_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. SALES & PIPELINE (Companies, Contacts, Leads, Deals)
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  location TEXT,
  size TEXT,
  annual_revenue REAL DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  name TEXT NOT NULL,
  job_title TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  linkedin TEXT,
  role TEXT,
  is_decision_maker INTEGER DEFAULT 0,
  notes TEXT,
  owner_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  location TEXT,
  industry TEXT,
  lead_source TEXT DEFAULT 'Website',
  interested_services TEXT,
  budget REAL DEFAULT 0,
  lead_score INTEGER DEFAULT 50,
  status TEXT DEFAULT 'New', -- New, Contacted, Responded, Qualified, Meeting Scheduled, Proposal Sent, Negotiation, Won, Lost, Nurture
  owner_id INTEGER,
  notes TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  last_contacted DATETIME,
  next_followup DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lead_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  rating_category TEXT NOT NULL, -- Cold (0-39), Warm (40-69), Hot (70-100)
  scoring_breakdown_json TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pipelines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pipeline_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  probability REAL DEFAULT 0,
  FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS deals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_name TEXT NOT NULL,
  company_id INTEGER,
  contact_id INTEGER,
  lead_id INTEGER,
  value REAL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  pipeline_id INTEGER NOT NULL,
  stage_id INTEGER NOT NULL,
  probability REAL DEFAULT 50,
  expected_close_date DATE,
  owner_id INTEGER,
  service_id INTEGER,
  proposal_id INTEGER,
  contract_id INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'Open', -- Open, Won, Lost
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (pipeline_id) REFERENCES pipelines(id),
  FOREIGN KEY (stage_id) REFERENCES pipeline_stages(id),
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS proposals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proposal_number TEXT UNIQUE NOT NULL,
  client_id INTEGER,
  company_name TEXT NOT NULL,
  services_json TEXT,
  packages_json TEXT,
  deliverables TEXT,
  pricing REAL DEFAULT 0,
  discount REAL DEFAULT 0,
  include_gst INTEGER DEFAULT 1,
  tax_amount REAL DEFAULT 0,
  total_amount REAL DEFAULT 0,
  terms TEXT,
  validity_date DATE,
  status TEXT DEFAULT 'Draft', -- Draft, Sent, Viewed, Accepted, Rejected, Expired
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_number TEXT UNIQUE NOT NULL,
  client_id INTEGER NOT NULL,
  deal_id INTEGER,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  renewal_date DATE,
  value REAL DEFAULT 0,
  payment_terms TEXT,
  scope TEXT,
  status TEXT DEFAULT 'Active', -- Draft, Active, Expiring, Renewed, Terminated
  signature_status TEXT DEFAULT 'Pending', -- Pending, Signed, Rejected
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. ACTIVITIES & MEETINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- Call, Email, WhatsApp, Meeting, Note, Follow-up, Task
  subject TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL, -- Lead, Contact, Company, Deal, Client, Project
  entity_id INTEGER NOT NULL,
  user_id INTEGER,
  due_date DATETIME,
  completed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS meetings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  participants_json TEXT,
  date_time DATETIME NOT NULL,
  agenda TEXT,
  notes TEXT,
  related_entity_type TEXT,
  related_entity_id INTEGER,
  status TEXT DEFAULT 'Scheduled', -- Scheduled, Completed, Cancelled
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- 4. CLIENT WORKSPACE & SERVICES
-- ============================================================================

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  base_price REAL DEFAULT 0,
  kpi_deliverables TEXT
);

CREATE TABLE IF NOT EXISTS service_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  package_name TEXT NOT NULL,
  price REAL DEFAULT 0,
  billing_cycle TEXT DEFAULT 'Monthly',
  deliverables_json TEXT,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  location TEXT,
  primary_contact_id INTEGER,
  account_manager_id INTEGER,
  status TEXT DEFAULT 'Active', -- Onboarding, Active, At Risk, Churned
  health_score INTEGER DEFAULT 85,
  health_status TEXT DEFAULT 'Green', -- Green, Yellow, Red
  health_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (primary_contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
  FOREIGN KEY (account_manager_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS client_health_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  health_score INTEGER NOT NULL,
  health_status TEXT NOT NULL,
  reason TEXT,
  updated_by INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- 5. PROJECT & TASK MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name TEXT NOT NULL,
  client_id INTEGER NOT NULL,
  service_id INTEGER,
  manager_id INTEGER,
  start_date DATE,
  end_date DATE,
  budget REAL DEFAULT 0,
  status TEXT DEFAULT 'Active', -- Planning, Onboarding, Active, Review, Client Approval, Completed, On Hold, Cancelled
  progress INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'Medium', -- Low, Medium, High, Urgent
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS project_members (
  project_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role_in_project TEXT,
  PRIMARY KEY (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  client_id INTEGER,
  project_id INTEGER,
  assignee_id INTEGER,
  priority TEXT DEFAULT 'Medium', -- Low, Medium, High, Urgent
  status TEXT DEFAULT 'Todo', -- Todo, In Progress, Waiting, Review, Completed
  start_date DATE,
  due_date DATE,
  checklist_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS task_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  comment TEXT NOT NULL,
  is_internal INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 6. MARKETING & MEDIA (SEO, Social, Content, Campaigns)
-- ============================================================================

CREATE TABLE IF NOT EXISTS seo_keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  keyword TEXT NOT NULL,
  search_volume INTEGER DEFAULT 0,
  difficulty INTEGER DEFAULT 0,
  current_rank INTEGER DEFAULT 0,
  previous_rank INTEGER DEFAULT 0,
  target_rank INTEGER DEFAULT 1,
  target_url TEXT,
  search_engine TEXT DEFAULT 'Google India',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seo_rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword_id INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  date_recorded DATE DEFAULT CURRENT_DATE,
  FOREIGN KEY (keyword_id) REFERENCES seo_keywords(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS backlinks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  domain TEXT NOT NULL,
  target_url TEXT NOT NULL,
  anchor_text TEXT,
  authority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active', -- Active, Lost, Broken
  acquired_date DATE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS social_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  platform TEXT NOT NULL, -- Instagram, Facebook, LinkedIn, YouTube, X, Google Business Profile
  content_type TEXT DEFAULT 'Post', -- Post, Story, Reel, Carousel, Video
  caption TEXT,
  creative_url TEXT,
  hashtags TEXT,
  content_pillar TEXT,
  scheduled_date DATETIME,
  status TEXT DEFAULT 'Draft', -- Idea, Draft, Design, Internal Review, Client Review, Approved, Scheduled, Published
  assigned_employee_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_employee_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS content_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL, -- Blog, Social post, Video, Reel, Ad copy, Email, Landing page, Website copy
  client_id INTEGER NOT NULL,
  writer_id INTEGER,
  editor_id INTEGER,
  target_keyword TEXT,
  status TEXT DEFAULT 'Draft',
  deadline DATE,
  version INTEGER DEFAULT 1,
  attachment_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (writer_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  platform TEXT NOT NULL, -- Google Ads, Meta Ads, LinkedIn Ads, TikTok, Other
  campaign_name TEXT NOT NULL,
  objective TEXT,
  budget REAL DEFAULT 0,
  spend REAL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'Active', -- Draft, Active, Paused, Completed
  target_audience TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS campaign_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr REAL DEFAULT 0,
  cpc REAL DEFAULT 0,
  leads INTEGER DEFAULT 0,
  cpl REAL DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate REAL DEFAULT 0,
  revenue REAL DEFAULT 0,
  roas REAL DEFAULT 0,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS creative_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  folder_name TEXT DEFAULT 'Creatives',
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  file_type TEXT,
  version INTEGER DEFAULT 1,
  tags TEXT,
  uploaded_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS approval_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  entity_type TEXT NOT NULL, -- Creative, Social Post, Content, Proposal
  entity_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  submitted_by INTEGER,
  reviewed_by INTEGER,
  status TEXT DEFAULT 'Pending', -- Pending, Internal Approved, Client Review, Approved, Changes Requested, Rejected
  comments TEXT,
  version INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- 7. FINANCE & SUBSCRIPTIONS (Invoices, Payments, Expenses, Profitability)
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT UNIQUE NOT NULL,
  client_id INTEGER NOT NULL,
  project_id INTEGER,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal REAL DEFAULT 0,
  include_gst INTEGER DEFAULT 1, -- 1 = Include GST (18%), 0 = No GST (0%)
  cgst_rate REAL DEFAULT 9.0,
  sgst_rate REAL DEFAULT 9.0,
  cgst_amount REAL DEFAULT 0,
  sgst_amount REAL DEFAULT 0,
  discount REAL DEFAULT 0,
  total_amount REAL DEFAULT 0,
  paid_amount REAL DEFAULT 0,
  balance_amount REAL DEFAULT 0,
  status TEXT DEFAULT 'Draft', -- Draft, Sent, Partially Paid, Paid, Overdue, Cancelled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity REAL DEFAULT 1,
  rate REAL DEFAULT 0,
  amount REAL DEFAULT 0,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  amount REAL DEFAULT 0,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'UPI', -- Bank Transfer, UPI, Credit Card, Cheque, Cash
  reference_number TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL, -- Software, Ad Spend, Office, Travel, Freelance, Hardware, Other
  amount REAL DEFAULT 0,
  expense_date DATE DEFAULT CURRENT_DATE,
  vendor TEXT,
  project_id INTEGER,
  client_id INTEGER,
  receipt_url TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  service_id INTEGER,
  amount REAL DEFAULT 0,
  billing_cycle TEXT DEFAULT 'Monthly', -- Monthly, Quarterly, Annual
  start_date DATE NOT NULL,
  renewal_date DATE NOT NULL,
  status TEXT DEFAULT 'Active', -- Active, Expiring, Cancelled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- ============================================================================
-- 8. SUPPORT & FEEDBACK
-- ============================================================================

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_number TEXT UNIQUE NOT NULL,
  client_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  priority TEXT DEFAULT 'Medium', -- Low, Medium, High, Urgent
  assignee_id INTEGER,
  status TEXT DEFAULT 'New', -- New, Assigned, In Progress, Waiting, Resolved, Closed
  description TEXT NOT NULL,
  attachment_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  satisfaction_score INTEGER DEFAULT 5,
  service_score INTEGER DEFAULT 5,
  communication_score INTEGER DEFAULT 5,
  comments TEXT,
  testimonial_permitted INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- ============================================================================
-- 9. NOTIFICATIONS & AUTOMATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  client_id INTEGER,
  type TEXT NOT NULL, -- Lead, Deal, Task, Invoice, Contract, Ticket, Approval, Alert
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL, -- NEW_LEAD, DEAL_WON, INVOICE_OVERDUE, CONTRACT_EXPIRING, CLIENT_HEALTH_RED
  conditions_json TEXT,
  actions_json TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER NOT NULL,
  trigger_payload_json TEXT,
  status TEXT DEFAULT 'Success', -- Success, Failed
  output_log TEXT,
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Indexing for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

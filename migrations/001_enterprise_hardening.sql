-- MIGRATION 001: ENTERPRISE HARDENING & CONCURRENCY
    PRAGMA foreign_keys = ON;

    -- Add CSRF Token to Sessions
    ALTER TABLE sessions ADD COLUMN csrf_token TEXT;

    -- Add Version & Soft-Delete to Leads
    ALTER TABLE leads ADD COLUMN version INTEGER DEFAULT 1;
    ALTER TABLE leads ADD COLUMN is_deleted INTEGER DEFAULT 0;

    -- Add Version & Soft-Delete to Deals
    ALTER TABLE deals ADD COLUMN version INTEGER DEFAULT 1;
    ALTER TABLE deals ADD COLUMN is_deleted INTEGER DEFAULT 0;

    -- Add Version & Soft-Delete to Clients
    ALTER TABLE clients ADD COLUMN version INTEGER DEFAULT 1;
    ALTER TABLE clients ADD COLUMN is_deleted INTEGER DEFAULT 0;

    -- Add Version & Soft-Delete to Projects
    ALTER TABLE projects ADD COLUMN version INTEGER DEFAULT 1;
    ALTER TABLE projects ADD COLUMN is_deleted INTEGER DEFAULT 0;

    -- Add Version & Soft-Delete to Tasks
    ALTER TABLE tasks ADD COLUMN version INTEGER DEFAULT 1;
    ALTER TABLE tasks ADD COLUMN is_deleted INTEGER DEFAULT 0;

    -- Add Version & Soft-Delete to Invoices
    ALTER TABLE invoices ADD COLUMN version INTEGER DEFAULT 1;
    ALTER TABLE invoices ADD COLUMN is_deleted INTEGER DEFAULT 0;

    -- Add Lockout & Security to Users
    ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN lockout_until DATETIME;
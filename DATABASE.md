# Database Schema & Data Model — GrowthBeacon CRM

The system uses a normalized relational database model (`schema.sql`) stored in `growth_beacon_crm.db`.

## Core Tables Summary
- `users`: User profiles, role references, password hashes (PBKDF2/SHA256).
- `roles` & `permissions`: 13 pre-seeded roles and permission matrices.
- `leads`: Lead records, lead scores, UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`).
- `deals`: Sales deals, pipeline stages, probability, win/loss status.
- `clients`: Active client retainers, 360° health scores (Green/Yellow/Red).
- `projects` & `tasks`: Operational execution, project timelines, task assignees, priorities.
- `invoices`, `payments`, `expenses`: Invoicing suite with **GST Toggle** (`include_gst`), payment receipts, expenses, and P&L.
- `tickets`, `feedback`: Support desk tickets and client review ratings.
- `workflows` & `audit_logs`: Automated triggers and immutable system audit logs.
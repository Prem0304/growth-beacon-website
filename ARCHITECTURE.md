# Architecture Specification — GrowthBeacon CRM

## Technical Stack
- **Language**: Python 3.13 Standard Library (`http.server`, `sqlite3`, `json`, `hashlib`, `secrets`)
- **Database Engine**: SQLite 3 (`growth_beacon_crm.db`) with foreign key enforcement and transactional integrity.
- **Frontend Layer**: Vanilla JavaScript ES6 (`crm-app.js`), Glassmorphic SaaS CSS Design System (`crm.css`).

## System Boundaries & Isolation
1. **Public Website**: Static agency marketing site (`index.html`, `services/`, `locations/`, `blog/`). Communicates with CRM strictly via `POST /api/v1/leads/public-enquiry`.
2. **Private CRM App**: Full-width agency operating system for employees. Protected by session tokens and server-side RBAC.
3. **Client Portal**: Dedicated view for client accounts, filtered server-side by `clientId`.
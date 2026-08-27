# REST API v1 Specification — GrowthBeacon CRM

Base URL: `http://localhost:8080/api/v1`

## Authentication Endpoints
- `POST /api/v1/auth/login` — Authenticates user, returns `{ success: true, token, user }`.
- `GET /api/v1/auth/me` — Verifies current session token.
- `POST /api/v1/auth/logout` — Terminates active session.

## Core Resource Endpoints
- `GET /api/v1/dashboard/metrics` — Returns executive KPI summary.
- `GET /api/v1/search?q=...` — Global search across leads, clients, deals, projects, invoices.
- `POST /api/v1/leads/public-enquiry` — Public enquiry webhook from agency website.
- `GET /api/v1/leads` & `POST /api/v1/leads` — Lead management CRUD.
- `POST /api/v1/leads/<id>/convert` — Converts lead/deal into Active Client Account & Onboarding Project.
- `GET /api/v1/invoices` & `POST /api/v1/invoices` — Invoices CRUD (supports `include_gst: true/false`).
- `POST /api/v1/payments` — Records payment against invoice and updates balance.
- `GET /api/v1/portal/dashboard` — Client Portal data (strictly scoped to logged-in client's `clientId`).
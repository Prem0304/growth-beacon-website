# GrowthBeacon Agency Operating System & CRM

The **GrowthBeacon CRM** is an end-to-end, production-ready agency operating platform built for GrowthBeacon (Digital Marketing Agency in Theni, Tamil Nadu).

## Core Architecture & Domain Structure
- **Public Marketing Website**: [https://www.growthbeacon.co.in](https://www.growthbeacon.co.in) (`/`)
- **Private CRM Application**: [https://app.growthbeacon.co.in](https://app.growthbeacon.co.in) (`/app/` or `/crm.html`)
- **Client Portal**: [https://app.growthbeacon.co.in/portal](https://app.growthbeacon.co.in/portal) (`/portal/` or `/client.html`)

## Key System Features
- **Normalized SQLite 3 Database** (`growth_beacon_crm.db`) with 44 relational tables.
- **Server-Side RBAC** with 13 pre-seeded role profiles (Super Admin, Admin, Sales Manager, Sales Exec, Account Manager, SEO Specialist, Performance Marketer, Social Media Manager, Content Team, Designer, Finance, Employee, Client).
- **GST Finance Suite** with configurable **GST Toggle** (`includeGst: true/false` for 18% GST vs 0% Non-GST invoicing).
- **Deal ➔ Client Auto-Conversion Workflow**: Marking a deal as WON automatically creates a Client Account, links onboarding projects, and generates tasks.
- **Public Website Enquiry Webhook API**: Receives enquiries from `contact/index.html` & `index.html`, auto-scores leads, and triggers notifications.
- **Client Portal Isolation**: Strict server-side `clientId` filtering prevents clients from viewing internal notes, employee details, or other clients' records.

## Quick Start
```bash
# Seed Database with Realistic Data
python seed.py

# Launch Production Server (Port 8080)
python server.py
```
- Open `http://localhost:8080/app/` for CRM App.
- Default Admin Login: `admin@growthbeacon.co.in` / `beacon2026`
- Default Client Login: `client@novaretail.com` / `beacon2026`
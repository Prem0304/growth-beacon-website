# GROWTHBEACON CRM — RENDER DEPLOYMENT & POSTGRESQL MANUAL

## Executive Summary

This guide outlines the step-by-step deployment procedure for hosting the **GrowthBeacon Agency Operating System (CRM)** backend on **Render** (`https://app.growthbeacon.co.in`) with a persistent **Render Managed PostgreSQL Database**.

---

## 1. Infrastructure Cost & Pricing (Verified Current Pricing)

| Service | Plan / Instance | Cost | Availability & Limits |
|---|---|---|---|
| **Render Web Service** | Free Instance (512MB RAM) | **$0 / month** | Shared CPU, sleeps after 15 mins of inactivity (30s cold start). |
| **Render Web Service** | Starter Instance (Production) | **$7 / month** | Dedicated 512MB RAM, 100% uptime, zero cold starts. |
| **Render PostgreSQL** | Free Instance (1GB Storage) | **$0 / month** *(90 Days)* | Expires 90 days after creation. 97 max connections. |
| **Render PostgreSQL** | Starter Instance (Production) | **$7 / month** | Persistent 10GB storage, 97 max connections, automated backups. |

> [!NOTE]
> **Total Recommended Production Cost**: **$14 / month** ($7/mo Starter Web Service + $7/mo Starter PostgreSQL Database).

---

## 2. Render One-Click Blueprint Deployment

1. Log into your Render dashboard at **[https://dashboard.render.com](https://dashboard.render.com)**.
2. Click **New +** ➔ **Blueprint**.
3. Connect your CRM GitHub Repository (`growth-beacon-crm`).
4. Render will automatically detect `render.yaml` and prompt you to create:
   - Web Service: `growthbeacon-crm-web`
   - Managed Database: `growthbeacon-crm-db`
5. Click **Apply**. Render will build the environment, run database migrations (`python migrations/migrate_postgres.py`), and deploy the API server.

---

## 3. Environment Variables Setup

Configure the following environment variables in your Render Web Service dashboard under **Settings ➔ Environment Variables**:

| Variable Name | Required Value / Description | Example Value |
|---|---|---|
| `PORT` | Exposed Port | `8080` |
| `DATABASE_URL` | Auto-populated by Render Database connection string | `postgresql://user:pass@host/growth_beacon_crm` |
| `ALLOWED_ORIGINS` | Permitted CORS Origins | `https://www.growthbeacon.co.in,https://app.growthbeacon.co.in` |

---

## 4. Custom Subdomain Setup (`app.growthbeacon.co.in`)

1. In Render Web Service settings, navigate to **Custom Domains**.
2. Click **Add Custom Domain** and enter `app.growthbeacon.co.in`.
3. In your DNS Provider (Cloudflare / GoDaddy / Hostinger), create a **CNAME Record**:
   - **Type**: `CNAME`
   - **Name**: `app`
   - **Target**: `growthbeacon-crm-web.onrender.com`
4. Render will automatically issue an **SSL/TLS Certificate** via Let's Encrypt.

---

## 5. PostgreSQL Automated Backups & Disaster Recovery

1. **Daily Backups**: Render Managed PostgreSQL automatically performs daily snapshots with a 7-day retention period.
2. **Manual Backup Restoration**:
   - To restore a snapshot, navigate to **Render Dashboard ➔ PostgreSQL Database ➔ Backups**, select a backup point, and click **Restore**.

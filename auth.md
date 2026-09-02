# Growth Beacon — Agent Authentication & Registration Manual (`auth.md`)

> Official authentication specification and registration guide for AI Agents, LLM Orchestrators, and Automated Systems interfacing with Growth Beacon services and APIs.

---

## 1. Authentication Overview

Growth Beacon supports three authentication patterns for autonomous agents and external API clients:

1. **Public Webhook Endpoint (No Auth Required)**:
   - `POST https://app.growthbeacon.co.in/api/v1/leads/public-enquiry`
   - Purpose: Direct submission of digital marketing audit requests and business leads.
   - Requirements: Rate-limited to 5 requests per 15 minutes per IP. Supports `X-Idempotency-Key` header.

2. **Bearer Token Authentication**:
   - Header: `Authorization: Bearer <agent_token>`
   - Purpose: Authenticated agent API actions, lead retrieval, and performance audit requests.

3. **OAuth 2.0 Client Credentials Flow**:
   - Token Endpoint: `https://app.growthbeacon.co.in/api/v1/auth/token`
   - Grant Type: `grant_type=client_credentials`
   - Authorization Server Metadata: `https://growthbeacon.co.in/.well-known/oauth-authorization-server`
   - Protected Resource Metadata: `https://growthbeacon.co.in/.well-known/oauth-protected-resource`

---

## 2. Agent Registration Steps

Autonomous agents requiring programmatic API access can register using the following workflow:

1. **Request Credentials**:
   - Email: `growth@growthbeacon.co.in` with subject `Agent API Access Request`.
   - Provide Agent Name, Developer/Organization Name, and requested API scopes (`leads:write`, `audit:read`, `services:read`).

2. **Obtain Client Credentials**:
   - Receive `client_id` and `client_secret` issued by Growth Beacon.

3. **Request OAuth Token**:
   ```http
   POST /api/v1/auth/token HTTP/1.1
   Host: app.growthbeacon.co.in
   Content-Type: application/x-www-form-urlencoded

   grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&scope=leads:write
   ```

4. **Use Access Token**:
   ```http
   POST /api/v1/leads/public-enquiry HTTP/1.1
   Host: app.growthbeacon.co.in
   Authorization: Bearer YOUR_ACCESS_TOKEN
   Content-Type: application/json
   X-Idempotency-Key: web_1725280000_agent123

   {
     "name": "Agency Client",
     "email": "client@example.com",
     "phone": "+91 98421 99999",
     "company": "Local Retailer",
     "service": "SEO & Google Maps",
     "message": "Automated lead submitted via Agent Protocol"
   }
   ```

---

## 3. Rate Limits & Security Policy

- **Rate Limits**: 100 requests per minute for authenticated agents; 5 requests per 15 minutes for public webhooks.
- **Idempotency**: Always pass `X-Idempotency-Key: <unique_id>` on state-changing POST requests.
- **Security Contact**: `growth@growthbeacon.co.in` or see `https://growthbeacon.co.in/.well-known/security.txt`.

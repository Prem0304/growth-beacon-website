# Security Architecture & OWASP Matrix — GrowthBeacon CRM

1. **Password Hashing**: PBKDF2 with SHA-256 and 100,000 iterations. Zero plaintext passwords stored.
2. **Session Security**: 48-character cryptographically secure token (`secrets.token_hex(24)`), stored server-side in `sessions` table.
3. **Role-Based Access Control (RBAC)**: Server-side authorization checks on all protected API routes.
4. **Client Isolation**: Client Portal requests enforce `clientId` checking to prevent IDOR (Insecure Direct Object References).
5. **CORS & Security Headers**: Includes HSTS, X-Content-Type-Options, Referrer Policy, and CORS controls.
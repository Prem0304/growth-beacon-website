# DNS Agent Discovery (DNS-AID) Setup Manual for GrowthBeacon

This document defines the exact DNS records to publish under `_index._agents.growthbeacon.co.in` to support **DNS-AID (DNS Agent Index & Discovery)**.

---

## 1. Required DNS Records Matrix

| Record Type | Name / Host | Content / Value | TTL |
|---|---|---|---|
| **TXT** | `_index._agents` | `"v=aid1; uri=https://growthbeacon.co.in/llms.txt; catalog=https://growthbeacon.co.in/.well-known/api-catalog; agent-config=https://growthbeacon.co.in/.well-known/agent-configuration.json"` | 3600 (Auto) |
| **HTTPS (SVCB)** | `_index._agents` | `1 . alpn="h2,h3" port="443" key6="/llms.txt"` | 3600 (Auto) |

---

## 2. Cloudflare DNS Step-by-Step Setup

1. Log into your **Cloudflare Dashboard** and select domain `growthbeacon.co.in`.
2. Go to **DNS ➔ Records ➔ Add Record**.
3. **Record 1 (TXT)**:
   - Type: `TXT`
   - Name: `_index._agents`
   - TTL: `Auto`
   - Content: `"v=aid1; uri=https://growthbeacon.co.in/llms.txt; catalog=https://growthbeacon.co.in/.well-known/api-catalog; agent-config=https://growthbeacon.co.in/.well-known/agent-configuration.json"`
4. **Record 2 (HTTPS / SVCB)**:
   - Type: `HTTPS`
   - Name: `_index._agents`
   - Target: `.`
   - Priority: `1`
   - Value: `alpn="h2,h3" port="443" key6="/llms.txt"`
5. Click **Save**.

---

## 3. Verification

Run the following lookup command in shell to verify record propagation:

```bash
dig TXT _index._agents.growthbeacon.co.in +short
```

Expected Output:
```text
"v=aid1; uri=https://growthbeacon.co.in/llms.txt; catalog=https://growthbeacon.co.in/.well-known/api-catalog; agent-config=https://growthbeacon.co.in/.well-known/agent-configuration.json"
```

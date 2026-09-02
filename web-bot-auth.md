# Growth Beacon — Web Bot Auth & HTTP Request Signing Specification (`web-bot-auth.md`)

> Technical specification for HTTP Message Signatures (RFC 9421) and Web Bot Authentication interfacing with Growth Beacon APIs and automated endpoints.

---

## 1. Web Bot Auth Overview

Web Bot Auth provides cryptographic request signing for AI crawlers, autonomous agents, and web bots. Signed requests guarantee payload integrity, prevent replay attacks, and verify bot identities without requiring static passwords.

- **Specification Standard**: RFC 9421 (HTTP Message Signatures)
- **Supported Signature Algorithms**: `ed25519` (EdDSA), `rsa-sha256` (RS256), `ecdsa-p256-sha256` (ES256)
- **Public Key Directory**: `https://growthbeacon.co.in/.well-known/jwks.json`
- **Specification Discovery**: `https://growthbeacon.co.in/.well-known/web-bot-auth.json`

---

## 2. Required Request Headers

Every signed request from a web bot or autonomous agent must include the following headers:

1. **`Date`**: RFC 7231 formatted date string (e.g. `Wed, 02 Sep 2026 14:15:00 GMT`).
2. **`Content-Digest`**: SHA-256 digest of the request body (e.g. `sha-256=:X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=:`).
3. **`Signature-Input`**: Defines key ID, signature components, creation time, and expiration.
4. **`Signature`**: Cryptographic signature generated using the bot's private key.

---

## 3. Signature Construction Example

### Step A: Compute Content-Digest Header
For a POST payload `{"name":"Agent Bot","email":"bot@example.com"}`:
```http
Content-Digest: sha-256=:47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=:
```

### Step B: Construct Signature Input Line
```http
Signature-Input: sig1=("@method" "@target-uri" "content-digest" "date");created=1725280000;keyid="gb-bot-auth-key-2026";alg="ed25519"
```

### Step C: Construct Signature Base & Sign
Signature Base String:
```text
"@method": POST
"@target-uri": https://app.growthbeacon.co.in/api/v1/leads/public-enquiry
"content-digest": sha-256=:47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=:
"date": Wed, 02 Sep 2026 14:15:00 GMT
```

Sign the UTF-8 bytes of Signature Base String using private key, base64 encode the output, and attach header:
```http
Signature: sig1=:d2ViX2JvdF9zaWduYXR1cmVfZXhhbXBsZV9iYXNlNjQ0NDQ0:=
```

---

## 4. HTTP Request Execution Example

```http
POST /api/v1/leads/public-enquiry HTTP/1.1
Host: app.growthbeacon.co.in
Date: Wed, 02 Sep 2026 14:15:00 GMT
Content-Type: application/json
Content-Digest: sha-256=:47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=:
Signature-Input: sig1=("@method" "@target-uri" "content-digest" "date");created=1725280000;keyid="gb-bot-auth-key-2026";alg="ed25519"
Signature: sig1=:d2ViX2JvdF9zaWduYXR1cmVfZXhhbXBsZV9iYXNlNjQ0NDQ0:=
X-Idempotency-Key: bot_req_1725280000_999

{
  "name": "Autonomous Agent Bot",
  "email": "bot@ai-agent.org",
  "phone": "+91 98421 99999",
  "company": "AI Logistics Ltd",
  "service": "SEO & Web Engineering",
  "message": "Signed request via RFC 9421 Web Bot Auth protocol"
}
```

---

## 5. Verification & Security Policies

- **Timestamp Window**: Requests with `created` timestamps older than 300 seconds (5 minutes) will be rejected to prevent replay attacks.
- **Key Registration**: Submit public JWKS to `growth@growthbeacon.co.in` or see `https://growthbeacon.co.in/auth.md`.

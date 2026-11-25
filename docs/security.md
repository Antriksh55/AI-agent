# Security and Privacy — NovaTech AI Sales Voice Agent

## MVP Security Controls (Implemented)

| Control | Implementation | Status |
|---|---|---|
| API key protection | GEMINI_API_KEY in .env, never in source code | ✅ Implemented |
| .env exclusion | .gitignore includes .env | ✅ Implemented |
| Input validation | Required fields checked in all routes | ✅ Implemented |
| CORS | Whitelist-based, configurable via ALLOWED_ORIGINS env var | ✅ Implemented |
| Rate limiting | 30 AI req/min, 120 general req/min per IP | ✅ Implemented |
| Safe logging | Request bodies not logged; API keys never logged | ✅ Implemented |
| Session isolation | Each conversationId has its own memory object | ✅ Implemented |
| Secure ID generation | UUID v4 (cryptographically random) | ✅ Implemented |
| Error handling | Stack traces only in development; sanitized in production | ✅ Implemented |
| Prompt protection | System instructions never returned to client | ✅ Implemented |

---

## Production Security Requirements

### Authentication and Authorization
- Implement JWT-based authentication for the admin dashboard.
- Role-based access control:
  - **Admin**: Full access to all leads, conversations, analytics.
  - **Sales Agent**: Can view assigned leads; cannot delete.
  - **Customer**: Access only to their own conversation (read-only via token).
- Short-lived access tokens (15 minutes) with refresh tokens (7 days).

### HTTPS / TLS
- Enforce HTTPS everywhere using Let's Encrypt or AWS ACM.
- Redirect all HTTP requests to HTTPS.
- Use TLS 1.2+ minimum; disable TLS 1.0 and 1.1.
- HSTS header with long max-age.

### Secrets Management
- Use a secrets manager (AWS Secrets Manager, HashiCorp Vault) instead of environment variables in production.
- Rotate API keys every 90 days.
- Never store secrets in Docker images, container environment variables visible to all users, or build artifacts.

### Database Security
- Restrict MongoDB/PostgreSQL access by IP allowlist.
- Use TLS for all database connections.
- Separate database user per service with least-privilege permissions.
- Never run the database as the root user.
- Encrypted backups stored in a separate region.

### Data Protection
- Encrypt sensitive fields (email, phone, company name) at rest using AES-256.
- Use field-level encryption for PII in MongoDB or column encryption in PostgreSQL.
- Pseudonymize data in analytics and logs (replace email with a hash).

### Voice Data Consent
- Before recording or processing any voice conversation:
  - Display a clear consent notice: "This conversation may be recorded and processed by AI."
  - Log the customer's consent decision with a timestamp.
  - Provide an opt-out option that disables recording.
- Under the Indian DPDP Act 2023, voice recordings that contain biometric data require explicit consent.

### Indian Data Protection (DPDP Act 2023)
Relevant provisions for this product:
1. **Purpose limitation**: Data collected for sales qualification must not be used for other purposes without fresh consent.
2. **Data minimization**: Collect only the information needed to qualify and serve the customer.
3. **Data localization**: For services processing Indian personal data, prefer servers in India (AWS ap-south-1).
4. **Right to erasure**: Provide a mechanism for customers to request deletion of their data.
5. **Data fiduciary obligations**: Register as a Significant Data Fiduciary if processing large volumes of sensitive personal data.
6. **Breach notification**: Report data breaches to the DPBI within prescribed timelines.

> ⚠️ This MVP does not implement full DPDP compliance. Engaging a legal counsel specializing in Indian data protection law is required before commercial deployment.

### Audit Logging
- Log every data access event (who accessed which lead, when).
- Immutable audit logs stored separately from application logs.
- Retain audit logs for at least 2 years.
- Do not log full conversation content in audit logs (PII exposure risk).

### Input Sanitization
- Sanitize user-provided text before inserting into prompts to prevent prompt injection.
- Reject messages containing known injection patterns (e.g., "ignore previous instructions").
- Limit message length (currently 2000 characters) to prevent token stuffing attacks.

### Backup and Disaster Recovery
- Automated daily backups of the database.
- Backup stored in a geographically separate region.
- Test restore procedure quarterly.
- Recovery Time Objective (RTO): < 4 hours.
- Recovery Point Objective (RPO): < 24 hours.

---

## What This MVP Does NOT Implement

| Feature | Status | Required Before Production |
|---|---|---|
| User authentication | ❌ Not implemented | Yes |
| Role-based access control | ❌ Not implemented | Yes |
| HTTPS | ❌ Local HTTP only | Yes |
| Field-level PII encryption | ❌ Not implemented | Yes |
| DPDP compliance | ❌ Documented only | Legal review required |
| Voice recording consent flow | ❌ Not implemented | Yes |
| Security penetration testing | ❌ Not performed | Yes |
| DDoS protection | ❌ Basic rate limiting only | Yes |

> Do not deploy this MVP to a public URL with real customer data.
> The above gaps must be addressed before any production deployment.

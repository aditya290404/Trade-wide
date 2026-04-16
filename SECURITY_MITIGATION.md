# Risk Analysis & Security Mitigation Report
**Project Name**: TradeWide Paper Trading Platform  
**Course**: Cloud Product and Platform Engineering (21IPE315P)

## 1. Threat Identification
We have identified the following primary risks to the TradeWide platform:
- **Authentication Bypass**: Unauthorized access to user portfolios.
- **DDoS/API Abuse**: Exhausting server resources or database connections.
- **Data Injection**: SQL injection via stock symbols or registration fields.
- **Sensitive Data Theft**: Stealing JWT tokens or intercepting email OTPs.

## 2. Mitigation Measures

### A. Defensive Middleware
- **Helmet.js**: Implemented to set secure HTTP headers (XSS protection, CSP).
- **Express Rate Limit**: Configured to limit each IP to 100 requests every 15 minutes, preventing brute-force and DDoS attempts.
- **CORS**: Restricted to legitimate origins to prevent cross-site request forgery.

### B. Secure Authentication
- **Dual-Layer MFA**: Uses both JWT (JSON Web Tokens) for session management and SendGrid OTP (One-Time Password) for email verification.
- **Bcrypt Hashing**: All user passwords are salted and hashed with 12 rounds of bcrypt before storage.
- **JWT Expiration**: Tokens are short-lived to minimize the impact of token leakage.

### C. Validation & Data Integrity
- **Zod Schema Validation**: Every API request is validated against a strict Zod schema before hitting the logic layer.
- **Prisma ORM**: Uses parameterized queries by default, effectively eliminating SQL Injection risks.

### D. Cloud Infrastructure Risks
- **Docker Isolation**: The backend and database are isolated in a private virtual network.
- **Environment Secrets**: Sensitive keys (SendGrid, JWT) are injected via environment variables and never committed to source control.

## 3. Residual Risk
While mitigations are robust, residual risks include phishing (tricking users into sharing OTPs) and third-party dependency vulnerabilities. We mitigate these through regular package audits (`npm audit`) and user education.

---
**Verified Implementation Date**: April 15, 2026

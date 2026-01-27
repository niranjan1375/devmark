# Security Audit - DevMark
**Date:** 27 January 2026  
**Status:** Issues Identified

## 🔴 CRITICAL Issues

### 1. Weak JWT Secret in Production
- **File:** `api/.env`, `api/src/plugins/jwt.ts`
- **Issue:** JWT_SECRET contains literal string `"your-super-secret-jwt-key-change-this-in-production-$(date +%s)"` - the shell variable is NOT evaluated
- **Risk:** Predictable JWT secret makes all tokens vulnerable to forgery
- **Fix:** Generate strong secret with `openssl rand -base64 64`
- **Priority:** IMMEDIATE

### 2. CORS Allows All Origins
- **File:** `api/src/index.ts` line 22
- **Issue:** `origin: true` allows ANY origin to access the API
- **Risk:** CSRF attacks, unauthorized access from malicious sites
- **Fix:** Restrict to specific domains: `origin: ['https://yourdomain.com']`
- **Priority:** IMMEDIATE (before production)

### 3. No Rate Limiting
- **File:** All API routes
- **Issue:** No rate limiting on authentication or API endpoints
- **Risk:** Brute force attacks on login/token endpoints, DoS attacks
- **Fix:** Install and configure `@fastify/rate-limit`
- **Priority:** IMMEDIATE

---

## 🟠 HIGH Priority Issues

### 4. Inefficient API Token Verification
- **File:** `api/src/utils/auth.ts` lines 75-105
- **Issue:** `verifyApiToken()` fetches ALL valid tokens from DB and compares each with bcrypt
- **Risk:** Performance bottleneck, scales poorly, vulnerable to timing attacks
- **Fix:** Add indexed lookup or use token prefix for quick filtering
- **Priority:** HIGH

### 5. XSS Vulnerability in Extension
- **File:** `extension/popup.js` line 93
- **Issue:** `tagEl.innerHTML` uses user input directly without sanitization
- **Risk:** Malicious tag names could execute arbitrary JavaScript
- **Fix:** Use `textContent` instead of `innerHTML`
- **Priority:** HIGH

### 6. Sensitive Data in .env File Committed
- **File:** `api/.env` (tracked in git)
- **Issue:** Environment file with secrets is committed to repository
- **Risk:** Credentials exposed in git history
- **Fix:** Add to `.gitignore`, remove from history, rotate secrets
- **Priority:** HIGH

### 7. Missing Input Sanitization
- **File:** `api/src/routes/bookmarks.ts`
- **Issue:** URL field accepts any string without validation
- **Risk:** Can store `javascript:` URLs or XSS payloads
- **Fix:** Add URL validation using URL constructor or regex
- **Priority:** HIGH

---

## 🟡 MEDIUM Priority Issues

### 8. No Password Strength Requirements
- **File:** `api/src/routes/auth.ts` line 13
- **Issue:** Accepts any password without length/complexity checks
- **Risk:** Users can set weak passwords vulnerable to dictionary attacks
- **Fix:** Enforce minimum 8 characters, complexity requirements
- **Priority:** MEDIUM

### 9. SQL Injection Risk (Potential)
- **File:** Database layer
- **Issue:** Using Prisma ORM (safe), but no documentation preventing raw queries
- **Risk:** Future developers might add unsafe raw queries
- **Fix:** Document query safety practices, add linting rules
- **Priority:** MEDIUM

### 10. No Token Expiration Enforcement
- **File:** `api/src/routes/apiTokens.ts`
- **Issue:** API tokens can be created without expiration date
- **Risk:** Long-lived tokens increase attack surface
- **Fix:** Set default expiration (e.g., 90 days), enforce maximum
- **Priority:** MEDIUM

### 11. Error Messages Leak Information
- **File:** `api/src/routes/auth.ts` lines 20, 61
- **Issue:** Different errors for "user exists" vs "invalid credentials"
- **Risk:** Attackers can enumerate valid email addresses
- **Fix:** Use generic "Authentication failed" messages
- **Priority:** MEDIUM

### 12. Missing Security Headers
- **File:** `api/src/index.ts`
- **Issue:** No Helmet.js or security headers (CSP, X-Frame-Options, HSTS)
- **Risk:** Various client-side attacks, clickjacking
- **Fix:** Install and configure `@fastify/helmet`
- **Priority:** MEDIUM

---

## 🔵 LOW Priority / Best Practices

### 13. No Audit Logging
- **File:** All routes
- **Issue:** No logging for security events (token creation/revocation, failed logins)
- **Risk:** Cannot detect or investigate security incidents
- **Fix:** Add structured logging with Winston or Pino
- **Priority:** LOW

### 14. No Email Verification
- **File:** `api/src/routes/auth.ts`
- **Issue:** Users can register with any email without verification
- **Risk:** Spam accounts, impersonation
- **Fix:** Implement email verification flow
- **Priority:** LOW

### 15. Browser Extension Hardcoded API URL
- **File:** `extension/popup.js` line 1
- **Issue:** `API_URL = 'http://localhost:3000'` hardcoded
- **Risk:** Cannot easily deploy to production
- **Fix:** Use chrome.storage or manifest configuration
- **Priority:** LOW

### 16. No HTTPS Enforcement
- **File:** API server configuration
- **Issue:** No checks or redirects for HTTPS in production
- **Risk:** Man-in-the-middle attacks, credential theft
- **Fix:** Add HTTPS enforcement middleware, HSTS headers
- **Priority:** LOW (critical for production)

### 17. Bcrypt Cost Factor
- **File:** `api/src/routes/auth.ts`, `api/src/routes/apiTokens.ts`
- **Issue:** Using bcrypt rounds=10, might be too low for modern hardware
- **Risk:** Faster brute force attacks on password hashes
- **Fix:** Increase to 12-14 rounds
- **Priority:** LOW

---

## Quick Win Summary

Issues that can be fixed in < 30 minutes:
- ✅ Issue #1: Generate strong JWT secret
- ✅ Issue #5: Fix XSS in extension (change innerHTML to textContent)
- ✅ Issue #6: Add .env to .gitignore
- ✅ Issue #7: Add URL validation
- ✅ Issue #11: Standardize error messages
- ✅ Issue #15: Make extension API URL configurable
- ✅ Issue #17: Increase bcrypt rounds

Issues requiring more effort:
- ⏰ Issue #2: CORS configuration (needs domain list)
- ⏰ Issue #3: Rate limiting (install package + config)
- ⏰ Issue #4: Token verification optimization (architectural change)
- ⏰ Issue #8: Password validation (implement validation logic)
- ⏰ Issue #12: Security headers (install + configure Helmet)

---

## Recommended Action Plan

### Phase 1 (Immediate - Today)
1. Fix JWT secret generation
2. Add .env to .gitignore
3. Fix XSS vulnerability in extension
4. Add URL validation
5. Standardize error messages

### Phase 2 (This Week)
1. Implement rate limiting
2. Configure CORS properly
3. Add security headers (Helmet)
4. Add password strength validation
5. Optimize token verification

### Phase 3 (Next Sprint)
1. Implement audit logging
2. Add email verification
3. Set token expiration policies
4. Add HTTPS enforcement
5. Review and update bcrypt rounds

---

## References
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- Fastify Security: https://www.fastify.io/docs/latest/Guides/Getting-Started/#your-first-plugin

# ADR 004: Security Strategy

**Date**: 2026-02-04  
**Status**: ✅ Accepted  
**Deciders**: Development Team

---

## Context

We need to ensure our application is secure against common web vulnerabilities, specifically the OWASP Top 10. The application handles sensitive user data and authentication, making security a critical priority.

### Key Threats

1. **Injection Attacks** (SQL/NoSQL)
2. **Cross-Site Scripting (XSS)**
3. **Broken Access Control**
4. **Data Exposure**
5. **Denial of Service (DoS)**

---

## Decision

We will implement a layered security approach using industry-standard middleware and best practices.

### 1. HTTP Header Security
**Tool**: `helmet`
**Implementation**: 
- Configure Content Security Policy (CSP)
- Disable `X-Powered-By` header
- Enforce HSTS (in production)
- Prevent clickjacking (X-Frame-Options)

### 2. Rate Limiting
**Tool**: `express-rate-limit`
**Implementation**:
- Global limit: 100 requests / 15 mins per IP
- Protects against brute-force and DoS attacks

### 3. Input Sanitization
**Tool**: `express-mongo-sanitize`
**Rationale**: Prevents NoSQL injection by stripping keys starting with `$` or `.` from input.

**Tool**: `xss-clean`
**Rationale**: Sanitizes user input to prevent XSS attacks.

**Tool**: `hpp`
**Rationale**: Prevents HTTP Parameter Pollution attacks by handling duplicate query parameters.

### 4. Authentication & Authorization
**Tools**: `passport`, `passport-jwt`, `bcrypt`
**Strategy**:
- Stateless JWT authentication
- Role-Based Access Control (RBAC) via middleware
- Strong password hashing with salt

### 5. CORS
**Tool**: `cors`
**Policy**: Restrict allowed origins to trusted domains via environment variables.

---

## Consequences

### Positive

✅ **Defense in Depth**: Multiple layers of security
✅ **Automated Protection**: Middleware handles common threats automatically
✅ **Compliance**: Aligns with OWASP recommendations
✅ **Performance**: Minimal overhead from security middleware

### Negative

⚠️ **CSP Complexity**: Strict CSP might block legitimate external resources (fonts, scripts)
⚠️ **False Positives**: Sanitization might strip legitimate characters (e.g., in specialized text fields)
⚠️ **Rate Limit Tuning**: Global limits might affect power users behind shared IPs (NAT)

---

## Validation Strategy

1. **Automated Scanning**: Use `npm audit` for dependency vulnerabilities.
2. **Manual Testing**: Attempt SQL injection and XSS payloads in input fields.
3. **Load Testing**: Verify rate limiting behavior.

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)

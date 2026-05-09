# ADR 005: Error Handling Strategy

**Date**: 2026-02-04  
**Status**: ✅ Accepted  
**Deciders**: Development Team

---

## Context

A robust application needs a consistent way to handle errors. We need to distinguish between trusted operational errors (e.g., validation failed) and programmer errors (bugs). We also need to avoid crashing the node process on unhandled rejections and provide meaningful responses to the client without leaking sensitive details.

### Requirements
- Centralized error handling
- Consistent error format
- Standardized error codes
- Secure error logging (no secrets logged)
- Distinction between production and development error details

---

## Decision

We will implement a centralized error handling strategy using:

1. **Custom `AppError` Class**: All operational errors (known application states) will instantiate this class.
2. **Global Error Middleware**: A single middleware argument `(err, req, res, next)` to capture all errors.
3. **`asyncHandler` Wrapper**: To eliminate repetitive `try-catch` blocks in controllers.
4. **Standardized Error Codes**: A constants file to maintain consistent error codes across the app.

### Error Classes

- `AppError` (Base)
- `ValidationError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)

### Response Format

**Development**:
```json
{
  "status": "ERROR",
  "code": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "stack": "Error: ... at ..."
}
```

**Production**:
```json
{
  "status": "ERROR",
  "code": "VALIDATION_ERROR",
  "message": "Invalid email format"
}
```

(Stack traces are hidden in production).

---

## Consequences

### Positive
✅ **Consistency**: Client always receives the same error structure.
✅ **Simplicity**: Controllers focus on happy path logic (using `asyncHandler`).
✅ **Security**: Sensitive stack traces not leaked in production.
✅ **Observability**: Centralized logging in the error handler.

### Negative
⚠️ **Refactoring Effort**: Existing controllers need to be updated to use `asyncHandler` and `throw new AppError` instead of `return res.status(...)`.

---

## Migration Plan

1. Implement `AppError`, `asyncHandler`, and `errorHandler`.
2. Update new features to use the new pattern.
3. Gradually refactor existing controllers (prioritizing critical paths).

---

## References

- [Joyent: Error Handling in Node.js](https://www.joyent.com/node-js/production/design/errors)
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)

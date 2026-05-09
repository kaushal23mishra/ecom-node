# ADR 006: Observability & Logging Strategy

**Date**: 2026-02-04  
**Status**: ✅ Accepted  
**Deciders**: Development Team

---

## Context

To effectively debug issues in production and monitor performance, we need a robust logging strategy. Simple `console.log` statements are insufficient because they lack structure, timestamps, and request context (Correlation IDs) in a concurrent environment.

### Requirements
- **Structured Logging**: JSON format for machine parsing.
- **Request Tracing**: Ability to trace a single request across all logs.
- **Context Propagation**: Automatically attach `requestId` to deep function calls.
- **Log Rotation**: Prevent disk space exhaustion.
- **Levels**: standard `error`, `warn`, `info`, `http`, `debug`.

---

## Decision

We will use **Winston** combined with **AsyncLocalStorage** for context propagation.

### 1. Structured Logging
All logs will be output in JSON format (in production) containing:
- Timestamp
- Log Level
- Message
- `requestId` (Correlation ID)
- Metadata (Stack trace, User ID, etc.)

### 2. Request Correlation
We use `AsyncLocalStorage` to store the Context (`requestId`) at the beginning of the request. The Logger automatically retrieves this context and appends it to every log entry.

### 3. Middleware
A `requestLogger` middleware will:
- Generate/Extract `x-request-id`.
- Initialize the context store.
- Log the start and end of every HTTP request (including duration).

---

## Consequences

### Positive
✅ **Traceability**: We can filter logs by `requestId` to see the full journey of a request.
✅ **Clean Code**: No need to pass `logger` or `requestId` down through every function argument.
✅ **Performance**: Log rotation prevents disk issues.
✅ **Standardization**: Uniform log format across the app.

### Negative
⚠️ **Complexity**: AsyncLocalStorage adds slight complexity to the mental model.
⚠️ **Performance Overhead**: Minimal, but context propagation has a small cost.

---

## References

- [Node.js AsyncLocalStorage](https://nodejs.org/api/async_context.html)
- [Winston Documentation](https://github.com/winstonjs/winston)
- [12-Factor App: Logs](https://12factor.net/logs)

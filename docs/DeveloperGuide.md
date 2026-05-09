# Developer Guide

This guide covers the day-to-day development workflows, including API documentation, testing, and database management.

---

## 📖 API Documentation

We use **Swagger (OpenAPI 3.0)** for API documentation. The documentation is generated from code annotations.

### Accessing Docs
- **Swagger UI**: `http://localhost:5001/api-docs`
- **JSON Spec**: `http://localhost:5001/api-docs-json`

### Documenting New Endpoints
Add JSDoc annotations to your routes using `@swagger` tags.
```javascript
/**
 * @swagger
 * /admin/user/create:
 *   post:
 *     summary: Create a user
 *     ...
 */
```

---

## 🧪 Testing Strategy

Stability is ensured through a tiered testing approach using **Jest** and **Supertest**.

### 1. Unit Tests
- **Location**: `__test__/unit`
- **Focus**: Testing Use Cases in isolation.
- **Rules**: Mock all external dependencies (DB, Services).
- **Run**: `npm test -- unit`

### 2. Integration Tests
- **Location**: `__test__/integration`
- **Focus**: Testing the API request-response cycle.
- **Rules**: Use an in-memory database (`mongodb-memory-server`).
- **Run**: `npm test -- integration`

### Coverage Requirements
We aim for **>80% code coverage**. Run `npm run test:coverage` to check.

---

## 🗄️ Database Management

### Mongoose Models
- Define schemas in `db/mongoDB/models/`.
- Use **Id Validator** and **Custom Labels** plugins.
- **Soft Deletes**: Always include an `isDeleted` flag. Use repositories to filter these out.

### Performance
- **Indexing**: Add indexes for frequently searched fields (e.g., `email`, `username`).
- **Lean Queries**: Use `.lean()` in repositories for read-only operations to bypass Mongoose overhead.

---

## 🛠️ Utilities

### Logging
Always use the centralized `logger` for all server logs.
```javascript
const logger = require('../utils/logger');
logger.info('Action performed', { userId: 123 });
```

### API Responses
Use the `responseHandler` to ensure all API responses have a consistent JSON structure.
```javascript
const responseHandler = require('../utils/response/responseHandler');
return responseHandler(res, result);
```

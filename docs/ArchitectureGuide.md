# Architecture & Code Guide

This document defines the architectural patterns, directory structure, and coding standards used in the **node_dhi** project.

---

## 🏗️ Architectural Patterns

### 1. Clean Architecture
We follow Uncle Bob's Clean Architecture to ensure independence from frameworks and high testability.

**The Dependency Rule**: Dependencies point inward!
1. **Entities Layer** (`entities/`): Plain business objects. Dependency-free.
2. **Use Cases Layer** (`use-case/`): Orchestration of entities and business rules.
3. **Controllers Layer** (`controller/`): Converts HTTP/External requests into Use Case inputs.
4. **Data Access Layer** (`data-access/`): Repository pattern implementation.
5. **Infrastructure Layer** (`db/`, `services/`): Low-level details (MongoDB, 3rd party APIs).

### 2. Repository Pattern
Data access is abstracted through "repositories" in `data-access/`. Controllers and Use Cases NEVER interact with Mongoose models directly.

### 3. Dependency Injection
Use cases receive their dependencies (like DB repositories) via function parameters. This allows us to easily mock databases during unit testing.

### 4. SOLID Principles
- **S (Single Responsibility)**: Each module (Controller, Use Case, Repository) has exactly one reason to change.
- **O (Open/Closed)**: Logic is open for extension (new Use Cases) but closed for modification.
- **L (Liskov Substitution)**: Repositories can be swapped (e.g., Mongo for Postgres) without breaking the business layer.
- **I (Interface Segregation)**: Repositories expose only the methods required by the domain.
- **D (Dependency Inversion)**: High-level modules (Use Cases) do not depend on low-level modules (Repos). Both depend on abstractions.

---

## 📁 Directory Structure & Organization

```text
node_dhi/
├── app.js                      # Application entry point & Middleware stack
├── use-case/                   # CORE: Pure business logic (Framework-agnostic)
├── entities/                   # CORE: Domain models and business rules
├── data-access/                # PORTS: Repository implementations
├── controller/                 # ADAPTERS: HTTP specific handling
├── db/mongoDB/models           # INFRA: Mongoose schemas
├── routes/                     # INFRA: Endpoint definitions
├── middleware/                 # CROSS-CUTTING: Security, Auth, Error Handling
└── services/                   # EXTERNAL: 3rd party integrations (SMS/Email)
```

---

## 🔄 Request Flow Example
1. **HTTP Request** hits the **Route**.
2. **Middleware** verifies Auth and validates input (Joi).
3. **Controller** extracts params and calls the appropriate **Use Case**.
4. **Use Case** performs logic and interacts with **Data Access (Repository)**.
5. **Data Access** queries the **Database** via Mongoose.
6. The data flows back up and is formatted by the **Response Handler**.

---

## 📝 Coding Standards & Conventions

### File Naming
- **Controllers**: `{action}{Entity}.js` (e.g., `createUser.js`)
- **Use Cases**: `{verb}{Entity}.js` (e.g., `addUser.js`)
- **Repositories**: `{entity}Db.js` (e.g., `userDb.js`)
- **Models**: `{entity}.js` (lowercase, e.g., `user.js`)

### JSDoc Documentation
All functions should be documented with JSDoc to help other developers (and IDEs) understand inputs and outputs.
```javascript
/**
 * Add a new user
 * @param {Object} userDb - User repository
 * @returns {Function} - Function receiving user data
 */
```

### Best Practices
- ✅ **Layer Purity**: Never import `express` or `mongoose` inside a Use Case.
- ✅ **Error Propagation**: Use the `AppError` class for operational errors.
- ✅ **Early Returns**: Use "Guard Clauses" to avoid nested `if/else` blocks.
- ✅ **Statelessness**: Ensure all logic is stateless for horizontal scaling.
- ✅ **Do** inject repositories into use-cases.
- ✅ **Do** write unit tests for every use-case.
- ❌ **Don't** use `console.log` for logging (use the `logger` utility).
- ❌ **Don't** put business logic in controllers.

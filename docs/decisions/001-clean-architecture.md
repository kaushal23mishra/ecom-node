# ADR 001: Adopt Clean Architecture Pattern

**Date**: 2026-02-04  
**Status**: ✅ Accepted  
**Deciders**: Development Team

---

## Context

We needed to choose an architectural pattern for our Node.js application that would:
- Support long-term maintainability
- Enable easy testing
- Allow framework independence
- Facilitate team collaboration
- Support future scalability

### Options Considered

1. **MVC (Model-View-Controller)**
   - ✅ Simple and well-known
   - ✅ Quick to implement
   - ❌ Business logic often mixed with controllers
   - ❌ Tight coupling with framework
   - ❌ Difficult to test

2. **Layered Architecture**
   - ✅ Clear separation of concerns
   - ✅ Easy to understand
   - ❌ Can become tightly coupled
   - ❌ Business logic can leak across layers

3. **Clean Architecture** ⭐ CHOSEN
   - ✅ Framework independence
   - ✅ Testable business logic
   - ✅ Clear dependency rules
   - ✅ Highly maintainable
   - ⚠️ More initial setup
   - ⚠️ Steeper learning curve

4. **Microservices**
   - ✅ Highly scalable
   - ✅ Independent deployment
   - ❌ Too complex for initial phase
   - ❌ Operational overhead
   - ❌ Network latency

---

## Decision

We will adopt **Clean Architecture** (also known as Hexagonal Architecture or Ports and Adapters) with the following layers:

```
┌─────────────────────────────────────┐
│         Controllers Layer           │  ← HTTP/External interfaces
├─────────────────────────────────────┤
│         Use Cases Layer             │  ← Business logic
├─────────────────────────────────────┤
│       Data Access Layer             │  ← Repository pattern
├─────────────────────────────────────┤
│         Entities Layer              │  ← Domain models
└─────────────────────────────────────┘
```

### Key Principles

1. **Dependency Rule**: Dependencies point inward only
2. **Framework Independence**: Business logic doesn't depend on Express
3. **Testability**: Use cases can be tested without HTTP layer
4. **Separation of Concerns**: Each layer has a single responsibility

---

## Consequences

### Positive

✅ **Testability**: Business logic can be tested in isolation with mocked dependencies
✅ **Maintainability**: Clear structure makes code easy to understand and modify
✅ **Framework Independence**: Can switch from Express to Fastify without changing business logic
✅ **Team Collaboration**: Clear boundaries make parallel development easier
✅ **Scalability**: Easy to extract microservices later if needed
✅ **Flexibility**: Can change database (MongoDB → PostgreSQL) without affecting use cases

### Negative

⚠️ **Learning Curve**: Team needs to understand Clean Architecture principles
⚠️ **Initial Overhead**: More files and boilerplate code
⚠️ **Verbosity**: More code compared to simple MVC
⚠️ **Over-engineering Risk**: Might be overkill for very simple CRUD apps

### Neutral

🔄 **Migration Path**: Existing MVC code can be gradually refactored
🔄 **Documentation**: Requires good documentation for new team members
🔄 **Code Reviews**: Need to ensure layers are not violated

---

## Implementation Details

### Directory Structure
```
controller/     → HTTP layer (Express specific)
use-case/       → Business logic (framework agnostic)
data-access/    → Repository pattern (database abstraction)
entities/       → Domain models
db/             → Database infrastructure (Mongoose)
```

### Example Flow
```javascript
// 1. Controller (HTTP layer)
const createUser = async (req, res) => {
  const result = await addUser(userDb)(req.body);
  res.json(result);
};

// 2. Use Case (Business logic)
const addUser = (userDb) => async (data) => {
  // Pure business logic, no Express dependency
  return await userDb.create(data);
};

// 3. Data Access (Repository)
const userDb = {
  create: (data) => User.create(data)
};
```

---

## Compliance

### How to Maintain This Decision

1. **Code Reviews**: Ensure no layer violations
2. **Testing**: Write unit tests for use cases
3. **Documentation**: Keep architecture docs updated
4. **Training**: Onboard new developers on Clean Architecture
5. **Linting**: Consider custom ESLint rules to enforce layer boundaries

### Red Flags (Violations)

❌ Use case importing Express
❌ Controller containing business logic
❌ Use case directly importing Mongoose models
❌ Entities depending on external frameworks

---

## References

- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Node.js Clean Architecture Example](https://github.com/jbuget/nodejs-clean-architecture-app)

---

## Review Schedule

- **Next Review**: 2026-08-04 (6 months)
- **Trigger for Review**: 
  - Team feedback on complexity
  - Performance issues
  - Scaling requirements change
  - New framework emerges

---

**Supersedes**: None (Initial decision)  
**Superseded by**: None (Current)

# ADR 002: Use Dependency Injection via Function Parameters

**Date**: 2026-02-04  
**Status**: ✅ Accepted  
**Deciders**: Development Team

---

## Context

We needed a dependency injection strategy that would:
- Enable easy testing with mocks
- Maintain loose coupling
- Avoid framework dependencies
- Keep code simple and readable
- Support Clean Architecture principles

### Options Considered

1. **No Dependency Injection (Direct Imports)**
   ```javascript
   // use-case/user/addUser.js
   const userDb = require('../../data-access/userDb');
   
   const addUser = async (data) => {
     return await userDb.create(data);
   };
   ```
   - ✅ Simple and straightforward
   - ✅ No additional setup
   - ❌ Hard to test (can't mock userDb)
   - ❌ Tight coupling
   - ❌ Violates Clean Architecture

2. **Dependency Injection Container (e.g., awilix, inversify)**
   ```javascript
   const { asClass, createContainer } = require('awilix');
   
   const container = createContainer();
   container.register({
     userDb: asClass(UserDb),
     addUser: asClass(AddUser)
   });
   ```
   - ✅ Automatic dependency resolution
   - ✅ Centralized configuration
   - ⚠️ Additional framework dependency
   - ⚠️ Learning curve
   - ⚠️ Magic/implicit dependencies

3. **Constructor Injection (Class-based)**
   ```javascript
   class AddUser {
     constructor(userDb) {
       this.userDb = userDb;
     }
     
     async execute(data) {
       return await this.userDb.create(data);
     }
   }
   ```
   - ✅ Explicit dependencies
   - ✅ Testable
   - ⚠️ More boilerplate
   - ⚠️ OOP overhead in JavaScript

4. **Function Parameter Injection** ⭐ CHOSEN
   ```javascript
   const addUser = (userDb) => async (data) => {
     return await userDb.create(data);
   };
   ```
   - ✅ Simple and functional
   - ✅ No framework needed
   - ✅ Easy to test
   - ✅ Explicit dependencies
   - ✅ JavaScript-idiomatic
   - ⚠️ Manual wiring in controllers

---

## Decision

We will use **Function Parameter Injection** (also called Currying or Partial Application) for dependency injection.

### Pattern

```javascript
// Use case definition
const useCaseFunction = (dependency1, dependency2) => (inputData) => {
  // Use dependencies
  return dependency1.someMethod(inputData);
};

// Controller usage
const result = await useCaseFunction(dep1, dep2)(data);
```

### Example

```javascript
// ✅ Use Case (use-case/user/addUser.js)
const addUser = (userDb) => async (data) => {
  // userDb is injected, not imported
  const user = await userDb.create(data);
  return user;
};

module.exports = addUser;

// ✅ Controller (controller/admin/user/createUser.js)
const userDb = require('../../../data-access/userDb');
const addUser = require('../../../use-case/user/addUser');

const createUser = async (req, res) => {
  // Inject dependency when calling use case
  const result = await addUser(userDb)(req.body);
  res.json(result);
};

module.exports = createUser;

// ✅ Test (test/use-case/user/addUser.test.js)
const addUser = require('../../../use-case/user/addUser');

test('should create user', async () => {
  // Mock dependency
  const mockUserDb = {
    create: jest.fn().mockResolvedValue({ id: 1 })
  };
  
  // Inject mock
  const result = await addUser(mockUserDb)({ name: 'Test' });
  
  expect(mockUserDb.create).toHaveBeenCalled();
  expect(result.id).toBe(1);
});
```

---

## Consequences

### Positive

✅ **No Framework Dependency**: Pure JavaScript, no DI container needed
✅ **Easy Testing**: Simple to inject mocks in tests
✅ **Explicit Dependencies**: Clear what each use case needs
✅ **Functional Style**: Idiomatic JavaScript/Node.js
✅ **Type Safety**: Works well with TypeScript (if migrated)
✅ **Flexibility**: Can easily change implementations
✅ **Performance**: No runtime overhead from DI container

### Negative

⚠️ **Manual Wiring**: Controllers must manually inject dependencies
⚠️ **Verbosity**: More function calls compared to direct imports
⚠️ **Learning Curve**: Team needs to understand currying pattern
⚠️ **No Auto-resolution**: Can't automatically resolve dependency trees

### Neutral

🔄 **Consistency**: Requires discipline to follow pattern everywhere
🔄 **Refactoring**: Changing dependencies requires updating injection points
🔄 **Documentation**: Need to document the pattern for new developers

---

## Implementation Guidelines

### ✅ DO: Inject All External Dependencies

```javascript
// Good: All dependencies injected
const createOrder = (orderDb, userDb, emailService) => async (data) => {
  const user = await userDb.findOne({ id: data.userId });
  const order = await orderDb.create(data);
  await emailService.send(user.email, 'Order created');
  return order;
};
```

### ❌ DON'T: Mix Injection and Direct Imports

```javascript
// Bad: Mixing patterns
const userDb = require('../../data-access/userDb'); // Direct import

const createOrder = (orderDb) => async (data) => {
  const user = await userDb.findOne({ id: data.userId }); // Not injected!
  return await orderDb.create(data);
};
```

### ✅ DO: Keep Use Cases Pure

```javascript
// Good: Pure function, no side effects
const calculateTotal = (orderDb) => async (orderId) => {
  const order = await orderDb.findOne({ id: orderId });
  return order.items.reduce((sum, item) => sum + item.price, 0);
};
```

### ❌ DON'T: Import Framework Code in Use Cases

```javascript
// Bad: Express dependency in use case
const express = require('express');

const addUser = (userDb) => async (req, res) => { // ❌ Express objects
  const user = await userDb.create(req.body);
  res.json(user); // ❌ HTTP response in use case
};
```

---

## Migration Strategy

### For New Code
- Always use function parameter injection
- Follow the pattern in examples

### For Existing Code
- Gradually refactor during feature work
- No need to refactor everything at once
- Prioritize critical/frequently tested code

---

## Alternative Considered: Dependency Injection Container

If the project grows significantly (100+ use cases), we may reconsider using a DI container like **awilix**:

```javascript
// Future consideration
const { asFunction, createContainer } = require('awilix');

const container = createContainer();
container.register({
  userDb: asFunction(makeUserDb),
  addUser: asFunction(makeAddUser).inject(() => ({ userDb: container.resolve('userDb') }))
});

const addUser = container.resolve('addUser');
```

**Trigger for Reconsideration**:
- 100+ use cases
- Complex dependency graphs
- Team requests it
- Testing becomes cumbersome

---

## Code Review Checklist

When reviewing code, ensure:

- [ ] Use cases receive dependencies as parameters
- [ ] Use cases don't import data access directly
- [ ] Use cases don't import Express or other frameworks
- [ ] Controllers inject all required dependencies
- [ ] Tests inject mocked dependencies
- [ ] No mixing of injection patterns

---

## References

- [Dependency Injection in JavaScript](https://www.freecodecamp.org/news/a-quick-intro-to-dependency-injection-what-it-is-and-when-to-use-it-7578c84fa88f/)
- [Functional Dependency Injection](https://medium.com/@Jeffijoe/dependency-injection-in-node-js-2016-edition-f2a88efdd427)
- [Clean Architecture in Node.js](https://khalilstemmler.com/articles/software-design-architecture/organizing-app-logic/)

---

## Review Schedule

- **Next Review**: 2026-08-04 (6 months)
- **Trigger for Review**:
  - Project exceeds 100 use cases
  - Team feedback on complexity
  - Testing becomes difficult
  - Performance issues

---

**Supersedes**: None (Initial decision)  
**Superseded by**: None (Current)

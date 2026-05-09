# ADR 003: Repository Pattern for Data Access

**Date**: 2026-02-04  
**Status**: ✅ Accepted  
**Deciders**: Development Team

---

## Context

We needed a strategy to abstract database operations that would:
- Decouple business logic from database implementation
- Enable easy testing with mocked data access
- Support potential database migrations (MongoDB → PostgreSQL)
- Provide consistent API across all entities
- Follow Clean Architecture principles

### Options Considered

1. **Direct Model Access in Use Cases**
   ```javascript
   // use-case/user/addUser.js
   const User = require('../../db/mongoDB/models/user');
   
   const addUser = async (data) => {
     return await User.create(data);
   };
   ```
   - ✅ Simple and direct
   - ✅ No abstraction overhead
   - ❌ Tight coupling to Mongoose
   - ❌ Hard to test
   - ❌ Violates Clean Architecture
   - ❌ Can't switch databases easily

2. **Generic Repository Class**
   ```javascript
   class Repository {
     constructor(model) {
       this.model = model;
     }
     
     async create(data) {
       return this.model.create(data);
     }
     
     async findOne(filter) {
       return this.model.findOne(filter);
     }
   }
   
   const userRepository = new Repository(User);
   ```
   - ✅ Reusable code
   - ✅ Consistent API
   - ⚠️ Less flexible for custom queries
   - ⚠️ OOP overhead

3. **Repository Pattern with Dedicated Modules** ⭐ CHOSEN
   ```javascript
   // data-access/userDb.js
   const User = require('../db/mongoDB/models/user');
   
   module.exports = {
     create: (data) => User.create(data),
     findOne: (filter) => User.findOne(filter),
     findMany: (filter) => User.find(filter),
     updateOne: (filter, data) => User.findOneAndUpdate(filter, data),
     deleteOne: (filter) => User.findOneAndDelete(filter)
   };
   ```
   - ✅ Database abstraction
   - ✅ Easy to test
   - ✅ Flexible for custom queries
   - ✅ Clear separation of concerns
   - ✅ Can add entity-specific methods
   - ⚠️ More files to maintain

4. **DAO (Data Access Object) Pattern**
   ```javascript
   class UserDAO {
     async create(data) { }
     async findById(id) { }
     async update(id, data) { }
     async delete(id) { }
   }
   ```
   - ✅ Clear interface
   - ✅ Testable
   - ⚠️ More boilerplate
   - ⚠️ OOP overhead in JavaScript

---

## Decision

We will implement the **Repository Pattern** using dedicated modules in the `data-access/` directory.

### Pattern Structure

```
data-access/
├── userDb.js           # User repository
├── orderDb.js          # Order repository
├── productDb.js        # Product repository
└── ...
```

### Standard Repository Interface

Each repository module exports:
- `create(data)` - Create new record
- `findOne(filter, options)` - Find single record
- `findMany(filter, options)` - Find multiple records
- `updateOne(filter, data, options)` - Update single record
- `updateMany(filter, data, options)` - Update multiple records
- `deleteOne(filter)` - Delete single record
- `deleteMany(filter)` - Delete multiple records
- `count(filter)` - Count records
- `paginate(filter, options)` - Paginated results
- Entity-specific methods as needed

---

## Implementation Example

### Basic Repository

```javascript
// data-access/userDb.js
const User = require('../db/mongoDB/models/user');

/**
 * Create a new user
 * @param {Object} data - User data
 * @returns {Promise<Object>} Created user
 */
const create = (data) => User.create(data);

/**
 * Find a single user
 * @param {Object} filter - Query filter
 * @param {Object} options - Query options (select, populate, etc.)
 * @returns {Promise<Object|null>} Found user or null
 */
const findOne = (filter, options = {}) => {
  let query = User.findOne(filter);
  
  if (options.select) {
    query = query.select(options.select);
  }
  
  if (options.populate) {
    query = query.populate(options.populate);
  }
  
  return query.exec();
};

/**
 * Find multiple users
 * @param {Object} filter - Query filter
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of users
 */
const findMany = (filter, options = {}) => {
  let query = User.find(filter);
  
  if (options.select) {
    query = query.select(options.select);
  }
  
  if (options.sort) {
    query = query.sort(options.sort);
  }
  
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  return query.exec();
};

/**
 * Update a single user
 * @param {Object} filter - Query filter
 * @param {Object} data - Update data
 * @param {Object} options - Update options
 * @returns {Promise<Object|null>} Updated user
 */
const updateOne = (filter, data, options = {}) => {
  return User.findOneAndUpdate(filter, data, {
    new: true,
    runValidators: true,
    ...options
  });
};

/**
 * Delete a single user
 * @param {Object} filter - Query filter
 * @returns {Promise<Object|null>} Deleted user
 */
const deleteOne = (filter) => User.findOneAndDelete(filter);

/**
 * Count users
 * @param {Object} filter - Query filter
 * @returns {Promise<number>} Count
 */
const count = (filter) => User.countDocuments(filter);

/**
 * Paginate users
 * @param {Object} filter - Query filter
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Paginated result
 */
const paginate = async (filter, options) => {
  return User.paginate(filter, options);
};

module.exports = {
  create,
  findOne,
  findMany,
  updateOne,
  deleteOne,
  count,
  paginate
};
```

### Repository with Custom Methods

```javascript
// data-access/orderDb.js
const Order = require('../db/mongoDB/models/order');

// Standard methods
const create = (data) => Order.create(data);
const findOne = (filter, options = {}) => Order.findOne(filter);

// Custom method specific to orders
const findByUserAndStatus = (userId, status) => {
  return Order.find({ userId, status }).sort({ createdAt: -1 });
};

const calculateTotalRevenue = async (startDate, endDate) => {
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  return result[0]?.total || 0;
};

module.exports = {
  create,
  findOne,
  findByUserAndStatus,
  calculateTotalRevenue
};
```

---

## Consequences

### Positive

✅ **Database Independence**: Business logic doesn't know about Mongoose
✅ **Easy Testing**: Simple to mock repositories in tests
✅ **Consistent API**: All repositories follow same pattern
✅ **Flexibility**: Can add entity-specific methods
✅ **Migration Ready**: Can switch to PostgreSQL by changing repositories only
✅ **Clean Architecture**: Respects dependency rule
✅ **Centralized Queries**: All database queries in one place per entity
✅ **Reusability**: Common queries can be reused across use cases

### Negative

⚠️ **More Files**: One repository per entity
⚠️ **Abstraction Overhead**: Extra layer between use cases and database
⚠️ **Duplication**: Similar code across repositories
⚠️ **Learning Curve**: Team needs to understand the pattern

### Neutral

🔄 **Maintenance**: Need to keep repositories updated with model changes
🔄 **Documentation**: Each repository should be well-documented
🔄 **Consistency**: Requires discipline to follow pattern

---

## Usage in Use Cases

### ✅ Good: Use Repository

```javascript
// use-case/user/addUser.js
const addUser = (userDb) => async (data) => {
  // Use repository methods
  const existingUser = await userDb.findOne({ email: data.email });
  
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  return await userDb.create(data);
};

module.exports = addUser;
```

### ❌ Bad: Direct Model Access

```javascript
// use-case/user/addUser.js
const User = require('../../db/mongoDB/models/user'); // ❌ Direct import

const addUser = async (data) => {
  const existingUser = await User.findOne({ email: data.email }); // ❌ Direct access
  
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  return await User.create(data); // ❌ Direct access
};
```

---

## Testing Strategy

### Unit Test with Mocked Repository

```javascript
// __test__/use-case/user/addUser.test.js
const addUser = require('../../../use-case/user/addUser');

describe('addUser', () => {
  it('should create user when email is unique', async () => {
    // Mock repository
    const mockUserDb = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' })
    };
    
    const userData = { email: 'test@example.com', name: 'Test' };
    const result = await addUser(mockUserDb)(userData);
    
    expect(mockUserDb.findOne).toHaveBeenCalledWith({ email: userData.email });
    expect(mockUserDb.create).toHaveBeenCalledWith(userData);
    expect(result.id).toBe(1);
  });
  
  it('should throw error when email already exists', async () => {
    const mockUserDb = {
      findOne: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' })
    };
    
    await expect(
      addUser(mockUserDb)({ email: 'test@example.com' })
    ).rejects.toThrow('User already exists');
  });
});
```

---

## Migration Path to Different Database

If we decide to migrate from MongoDB to PostgreSQL:

### Step 1: Create New Repository Implementation

```javascript
// data-access/userDb.postgres.js
const { Pool } = require('pg');
const pool = new Pool();

const create = async (data) => {
  const result = await pool.query(
    'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
    [data.email, data.name]
  );
  return result.rows[0];
};

const findOne = async (filter) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 LIMIT 1',
    [filter.email]
  );
  return result.rows[0];
};

module.exports = { create, findOne };
```

### Step 2: Swap Repository in Controllers

```javascript
// Before
const userDb = require('../../../data-access/userDb'); // MongoDB

// After
const userDb = require('../../../data-access/userDb.postgres'); // PostgreSQL
```

### Step 3: Use Cases Remain Unchanged ✅

```javascript
// use-case/user/addUser.js
// No changes needed! Still works with PostgreSQL repository
const addUser = (userDb) => async (data) => {
  return await userDb.create(data);
};
```

---

## Guidelines

### DO ✅

1. **Keep repositories focused on data access only**
2. **Use consistent method names across repositories**
3. **Document each repository method**
4. **Add entity-specific methods when needed**
5. **Return plain objects, not Mongoose documents** (use `.lean()` or `.toObject()`)

### DON'T ❌

1. **Don't put business logic in repositories**
2. **Don't import repositories directly in use cases** (inject them)
3. **Don't expose Mongoose-specific methods** (like `.populate()` options)
4. **Don't mix database implementations** in the same repository

---

## Code Review Checklist

- [ ] Repository is in `data-access/` directory
- [ ] Repository exports standard methods (create, findOne, etc.)
- [ ] Repository doesn't contain business logic
- [ ] Use cases inject repository as dependency
- [ ] Tests mock repository methods
- [ ] Repository methods are documented
- [ ] Repository returns plain objects (not Mongoose docs)

---

## References

- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Data Access Layer in Node.js](https://khalilstemmler.com/articles/typescript-domain-driven-design/repository-dto-mapper/)
- [Clean Architecture Data Access](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## Review Schedule

- **Next Review**: 2026-08-04 (6 months)
- **Trigger for Review**:
  - Database migration planned
  - Performance issues with current approach
  - Team feedback on complexity
  - New database requirements

---

**Supersedes**: None (Initial decision)  
**Superseded by**: None (Current)

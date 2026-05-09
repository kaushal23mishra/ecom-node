const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Global Setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_secret_key_must_be_at_least_32_chars_long';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.DB_URL = uri.endsWith('/') ? uri + 'EcomDb_test' : uri + '/EcomDb_test';

  await mongoose.connect(process.env.DB_URL);
});

// Global Teardown
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

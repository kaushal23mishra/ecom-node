const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function start() {
  console.log('✨ Starting Persistent In-Memory MongoDB...');

  // Ensure db path exists
  const dbPath = path.join(__dirname, '../.db_data');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  const mongod = await MongoMemoryServer.create({
    instance: {
      dbPath: dbPath,
      storageEngine: 'wiredTiger',
      port: 27017, // Keep it fixed for consistency
    },
  });

  const uri = mongod.getUri();
  console.log(`✅ MongoDB Persistent Server started at: ${uri}`);
  console.log(`📂 Data directory: ${dbPath}`);

  process.env.DB_URL = uri;
  process.env.NODE_ENV = 'development';
  process.env.PORT = process.env.PORT || 5001;

  console.log('🚀 Starting Node API Server...');
  const child = spawn('npx', ['ts-node', '--transpile-only', 'src/app.ts'], {
    env: process.env,
    stdio: 'inherit',
  });

  child.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
    /*
     * We don't necessarily want to stop if we want it to persist,
     * but for this script, we stop when the process dies.
     */
    mongod.stop();
    process.exit(code);
  });

  process.on('SIGINT', async () => {
    console.log('\nStopping servers...');
    await mongod.stop();
    child.kill();
    process.exit(0);
  });
}

start().catch((err) => {
  console.error('Failed to start dev server:', err);
  process.exit(1);
});

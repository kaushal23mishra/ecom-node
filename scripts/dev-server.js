const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const path = require('path');

async function start() {
    console.log('✨ Starting In-Memory MongoDB...');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log(`✅ MongoDB Memory Server started at: ${uri}`);

    process.env.DB_URL = uri;
    process.env.NODE_ENV = 'development';
    process.env.PORT = process.env.PORT || 5001;

    console.log('🚀 Starting Node API Server...');
    const child = spawn('npx', ['ts-node', '--transpile-only', 'src/app.ts'], {
        env: process.env,
        stdio: 'inherit'
    });

    child.on('close', (code) => {
        console.log(`Server exited with code ${code}`);
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

start().catch(err => {
    console.error('Failed to start dev server:', err);
    process.exit(1);
});

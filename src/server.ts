import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { seedDatabase } from './utils/seedData';

async function start() {
  await connectDatabase();

  if (env.nodeEnv === 'development') {
    await seedDatabase();
  }

  app.listen(env.port, () => {
    console.log(`[Server] LocalFix API running on port ${env.port} in ${env.nodeEnv} mode`);
    console.log(`[Server] Health check: http://localhost:${env.port}/api/health`);
  });
}

start().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});

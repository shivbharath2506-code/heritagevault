import { initDatabase, seedInitialData } from './db.js';

async function runSeed() {
  console.log('--- Starting Standalone Database Seeding for Government Museum Chennai ---');
  await initDatabase();
  await seedInitialData();
  console.log('--- Seeding Completed Successfully ---');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seed execution failed:', err);
  process.exit(1);
});

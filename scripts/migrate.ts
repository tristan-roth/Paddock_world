import { config } from 'dotenv';

config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. See .env.example.');
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('Migrations Neon appliquées avec succès.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

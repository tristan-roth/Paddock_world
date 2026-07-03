import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

type Database = ReturnType<typeof drizzle<typeof schema>>;

let instance: Database | undefined;

function createDb(): Database {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. See .env.example.');
  }
  return drizzle(neon(process.env.DATABASE_URL), { schema });
}

// Init paresseuse : la validation de DATABASE_URL ne doit pas jeter au chargement
// du module (import), sinon les Route Handlers de app/api/f1/** crashent avant
// même d'entrer dans leur try/catch. En différant l'erreur au premier accès
// réel (ex. db.select), elle survient à l'intérieur du try/catch de la route,
// qui peut alors répondre 503 proprement au lieu de laisser Next.js renvoyer
// une page d'erreur brute.
export const db: Database = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    if (!instance) instance = createDb();
    return Reflect.get(instance as object, prop, receiver);
  },
});

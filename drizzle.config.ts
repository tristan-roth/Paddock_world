import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Seule la commande `drizzle-kit migrate` a besoin d'une vraie connexion ;
    // `drizzle-kit generate` fonctionne hors-ligne à partir du schéma seul.
    url: process.env.DATABASE_URL ?? 'postgresql://placeholder',
  },
});

/**
 * Seed des couleurs d'écurie (`constructors.color`).
 *
 * Usage : npm run seed:colors [-- --force]
 *
 * `constructors.color` est absent de l'API Jolpica : la colonne se remplit à
 * la main, et sync-f1.ts ne l'écrase jamais (voir son en-tête). Ce script est
 * ce remplissage manuel, versionné plutôt que tapé en SQL à la volée — les
 * couleurs pilotent tout le rendu des classements (liseré de ligne, barre
 * d'écart, monogramme), une écurie sans couleur retombe en gris neutre.
 *
 * Idempotent : ne touche que les écuries dont la couleur est absente ou
 * différente. `--force` réécrit même une couleur déjà posée à la main.
 */

import { config } from 'dotenv';

config({ path: '.env.local' });

import { parseArgs } from 'node:util';

import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

import { constructors } from '../lib/db/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. See .env.example.');
}

const db = drizzle(neon(process.env.DATABASE_URL));

/**
 * Couleur de marque par constructorId Jolpica. Teintes officielles des livrées
 * courantes ; à ajuster ici quand une écurie change d'identité visuelle.
 */
const TEAM_COLORS: Record<string, string> = {
  mercedes: '#27F4D2',
  ferrari: '#E8002D',
  red_bull: '#3671C6',
  mclaren: '#FF8000',
  aston_martin: '#229971',
  alpine: '#FF87BC',
  williams: '#64C4FF',
  rb: '#6692FF',
  haas: '#B6BABD',
  // Écuries arrivées en 2026 : couleurs de marque (livrées non dévoilées).
  audi: '#F50537',
  cadillac: '#B3995D',
  // Écuries des saisons antérieures, toujours sélectionnables au calendrier.
  sauber: '#52E252',
  alfa: '#C92D4B',
  alphatauri: '#5E8FAA',
};

async function main() {
  const { values } = parseArgs({ options: { force: { type: 'boolean', default: false } } });
  const force = values.force ?? false;

  const rows = await db.select().from(constructors);
  if (rows.length === 0) {
    console.log('Aucune écurie en base — lancer `npm run sync:f1` d’abord.');
    return;
  }

  let updated = 0;
  let skipped = 0;
  const unknown: string[] = [];

  for (const team of rows) {
    const color = TEAM_COLORS[team.id];
    if (!color) {
      unknown.push(`${team.id} (${team.name})`);
      continue;
    }
    if (team.color === color) {
      skipped += 1;
      continue;
    }
    // Sans --force, une couleur déjà posée à la main fait autorité.
    if (team.color !== null && !force) {
      skipped += 1;
      continue;
    }

    await db
      .update(constructors)
      .set({ color, updatedAt: new Date() })
      .where(eq(constructors.id, team.id));
    console.log(`  ${team.name.padEnd(20)} → ${color}`);
    updated += 1;
  }

  console.log(`\n${updated} mise(s) à jour, ${skipped} inchangée(s).`);
  if (unknown.length > 0) {
    console.log(`\nSans couleur connue (retomberont en gris) :\n  ${unknown.join('\n  ')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

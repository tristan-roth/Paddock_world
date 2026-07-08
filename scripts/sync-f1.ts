/**
 * Script d'ingestion F1 : alimente la BD Neon depuis l'API Jolpica-F1.
 *
 * Usage : tsx scripts/sync-f1.ts [--scope core|results|all] [--season 2026]
 *   - core    : calendrier (circuits + courses), pilotes, écuries
 *   - results : core (prérequis FK) + résultats course/qualifs + classements
 *   - all     : identique à results (défaut)
 *
 * Idempotent : upsert par clé naturelle, avec détection de changement par
 * hash de payload (table sync_state) puis diff ligne à ligne — les champs
 * renseignés manuellement en BD (constructors.color...) ne sont jamais
 * écrasés. Les données circuit absentes de Jolpica (continent, longueur,
 * tours) proviennent du référentiel curaté lib/f1/circuit-details.ts.
 * Sort avec un code ≠ 0 si la source est indisponible.
 */

import { config } from 'dotenv';

config({ path: '.env.local' });

import { createHash } from 'node:crypto';
import { appendFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { neon } from '@neondatabase/serverless';
import { and, eq, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

import {
  circuits,
  constructors,
  constructorStandings,
  drivers,
  driverStandings,
  qualifyingResults,
  raceResults,
  races,
  syncState,
} from '../lib/db/schema';
import { CIRCUIT_DETAILS } from '../lib/f1/circuit-details';
import {
  fetchCalendar,
  fetchConstructors,
  fetchConstructorStandings,
  fetchDrivers,
  fetchDriverStandings,
  fetchQualifyingResults,
  fetchRaceResults,
} from '../lib/f1/jolpica';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. See .env.example.');
}

const db = drizzle(neon(process.env.DATABASE_URL));

const INSERT_CHUNK_SIZE = 200;

interface Stats {
  created: number;
  updated: number;
  skipped: number;
}

type ResourceOutcome = { label: string } & ({ status: 'synced'; stats: Stats } | { status: 'unchanged' });

// --- Helpers génériques ---

function sha256(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

/** Vrai si le payload est identique au dernier ingéré pour cette ressource. */
async function payloadUnchanged(resource: string, hash: string): Promise<boolean> {
  const [row] = await db.select().from(syncState).where(eq(syncState.resource, resource));
  return row?.payloadHash === hash;
}

/** Enregistre le hash une fois les écritures appliquées avec succès. */
async function recordPayloadHash(resource: string, hash: string): Promise<void> {
  await db
    .insert(syncState)
    .values({ resource, payloadHash: hash, syncedAt: new Date() })
    .onConflictDoUpdate({
      target: syncState.resource,
      set: { payloadHash: hash, syncedAt: new Date() },
    });
}

/**
 * Diff ligne à ligne : insère les lignes absentes, ne met à jour que celles
 * dont au moins un champ géré diffère, compte le reste comme inchangé.
 * Seuls les champs présents dans `incoming` sont comparés et écrits — les
 * colonnes gérées manuellement en BD sont donc préservées.
 */
async function syncRows<TRow extends { id: string }>(opts: {
  incoming: TRow[];
  existing: Array<Record<string, unknown> & { id: string }>;
  insert: (rows: TRow[]) => Promise<void>;
  update: (row: TRow) => Promise<void>;
}): Promise<Stats> {
  const existingById = new Map(opts.existing.map((row) => [row.id, row]));
  const toInsert: TRow[] = [];
  const toUpdate: TRow[] = [];
  let skipped = 0;

  for (const row of opts.incoming) {
    const current = existingById.get(row.id);
    if (!current) {
      toInsert.push(row);
      continue;
    }
    const changed = Object.entries(row).some(
      ([key, value]) => key !== 'id' && current[key] !== value,
    );
    if (changed) toUpdate.push(row);
    else skipped++;
  }

  for (let i = 0; i < toInsert.length; i += INSERT_CHUNK_SIZE) {
    await opts.insert(toInsert.slice(i, i + INSERT_CHUNK_SIZE));
  }
  for (const row of toUpdate) {
    await opts.update(row);
  }

  return { created: toInsert.length, updated: toUpdate.length, skipped };
}

// --- Sync par ressource ---

async function syncCalendar(season: number): Promise<ResourceOutcome[]> {
  const calendar = await fetchCalendar(season);
  // Le référentiel curaté fait partie du hash : modifier une valeur dans
  // circuit-details.ts invalide le sync même si le payload Jolpica n'a pas bougé.
  const hash = sha256({ calendar, circuitDetails: CIRCUIT_DETAILS });
  const resource = `calendar:${season}`;
  if (await payloadUnchanged(resource, hash)) {
    return [
      { label: 'circuits', status: 'unchanged' },
      { label: 'courses', status: 'unchanged' },
    ];
  }

  // Un même circuit apparaît une fois par course : dédupliquer par id.
  // Le continent (absent de Jolpica) n'est inclus que si le circuit est
  // référencé dans circuit-details.ts — syncRows ne compare/n'écrit que les
  // champs présents, une valeur posée à la main en BD n'est donc pas écrasée.
  const circuitRows = [
    ...new Map(
      calendar.map((race) => {
        const details = CIRCUIT_DETAILS[race.Circuit.circuitId];
        const lat = Number(race.Circuit.Location.lat);
        const long = Number(race.Circuit.Location.long);
        return [
          race.Circuit.circuitId,
          {
            id: race.Circuit.circuitId,
            name: race.Circuit.circuitName,
            locality: race.Circuit.Location.locality,
            country: race.Circuit.Location.country,
            // Coordonnées géographiques pour le globe 3D (positionnement des
            // circuits). Jolpica les fournit en chaîne ; on n'écrit que si elles
            // sont finies pour ne pas insérer de NaN.
            ...(Number.isFinite(lat) ? { latitude: lat } : {}),
            ...(Number.isFinite(long) ? { longitude: long } : {}),
            ...(details ? { continent: details.continent } : {}),
          },
        ];
      }),
    ).values(),
  ];

  const circuitStats = await syncRows({
    incoming: circuitRows,
    existing: await db.select().from(circuits),
    insert: (rows) => db.insert(circuits).values(rows).then(),
    update: ({ id, ...rest }) =>
      db.update(circuits).set({ ...rest, updatedAt: new Date() }).where(eq(circuits.id, id)).then(),
  });

  const raceRows = calendar.map((race) => {
    const details = CIRCUIT_DETAILS[race.Circuit.circuitId];
    return {
      id: `${race.season}-${race.round}`,
      season: Number(race.season),
      round: Number(race.round),
      circuitId: race.Circuit.circuitId,
      name: race.raceName,
      date: race.date,
      sprintWeekend: Boolean(race.Sprint),
      ...(details ? { lengthKm: details.lengthKm, laps: details.laps } : {}),
    };
  });

  const raceStats = await syncRows({
    incoming: raceRows,
    existing: await db.select().from(races).where(eq(races.season, season)),
    insert: (rows) => db.insert(races).values(rows).then(),
    update: ({ id, ...rest }) =>
      db.update(races).set({ ...rest, updatedAt: new Date() }).where(eq(races.id, id)).then(),
  });

  await recordPayloadHash(resource, hash);
  return [
    { label: 'circuits', status: 'synced', stats: circuitStats },
    { label: 'courses', status: 'synced', stats: raceStats },
  ];
}

async function syncDrivers(season: number): Promise<ResourceOutcome> {
  const payload = await fetchDrivers(season);
  const hash = sha256(payload);
  const resource = `drivers:${season}`;
  if (await payloadUnchanged(resource, hash)) return { label: 'pilotes', status: 'unchanged' };

  const stats = await syncRows({
    incoming: payload.map((driver) => ({
      id: driver.driverId,
      code: driver.code ?? null,
      number: driver.permanentNumber ? Number(driver.permanentNumber) : null,
      firstName: driver.givenName,
      lastName: driver.familyName,
      nationality: driver.nationality ?? null,
      dateOfBirth: driver.dateOfBirth ?? null,
    })),
    existing: await db.select().from(drivers),
    insert: (rows) => db.insert(drivers).values(rows).then(),
    update: ({ id, ...rest }) =>
      db.update(drivers).set({ ...rest, updatedAt: new Date() }).where(eq(drivers.id, id)).then(),
  });

  await recordPayloadHash(resource, hash);
  return { label: 'pilotes', status: 'synced', stats };
}

async function syncConstructors(season: number): Promise<ResourceOutcome> {
  const payload = await fetchConstructors(season);
  const hash = sha256(payload);
  const resource = `constructors:${season}`;
  if (await payloadUnchanged(resource, hash)) return { label: 'écuries', status: 'unchanged' };

  const stats = await syncRows({
    incoming: payload.map((constructor) => ({
      id: constructor.constructorId,
      name: constructor.name,
      nationality: constructor.nationality,
    })),
    existing: await db.select().from(constructors),
    insert: (rows) => db.insert(constructors).values(rows).then(),
    update: ({ id, ...rest }) =>
      db
        .update(constructors)
        .set({ ...rest, updatedAt: new Date() })
        .where(eq(constructors.id, id))
        .then(),
  });

  await recordPayloadHash(resource, hash);
  return { label: 'écuries', status: 'synced', stats };
}

async function syncRaceResults(season: number): Promise<ResourceOutcome> {
  const payload = await fetchRaceResults(season);
  const hash = sha256(payload);
  const resource = `results:${season}`;
  if (await payloadUnchanged(resource, hash)) return { label: 'résultats', status: 'unchanged' };

  const incoming = payload.flatMap((race) =>
    race.Results.map((result) => ({
      id: `${race.season}-${race.round}-${result.Driver.driverId}`,
      raceId: `${race.season}-${race.round}`,
      driverId: result.Driver.driverId,
      constructorId: result.Constructor.constructorId,
      grid: Number(result.grid),
      position: Number(result.position),
      positionText: result.positionText,
      points: Number(result.points),
      status: result.status,
    })),
  );

  const stats = await syncRows({
    incoming,
    existing: await db.select().from(raceResults).where(like(raceResults.raceId, `${season}-%`)),
    insert: (rows) => db.insert(raceResults).values(rows).then(),
    update: ({ id, ...rest }) =>
      db
        .update(raceResults)
        .set({ ...rest, updatedAt: new Date() })
        .where(eq(raceResults.id, id))
        .then(),
  });

  await recordPayloadHash(resource, hash);
  return { label: 'résultats', status: 'synced', stats };
}

async function syncQualifying(season: number): Promise<ResourceOutcome> {
  const payload = await fetchQualifyingResults(season);
  const hash = sha256(payload);
  const resource = `qualifying:${season}`;
  if (await payloadUnchanged(resource, hash)) return { label: 'qualifications', status: 'unchanged' };

  const incoming = payload.flatMap((race) =>
    race.QualifyingResults.map((result) => ({
      id: `${race.season}-${race.round}-${result.Driver.driverId}`,
      raceId: `${race.season}-${race.round}`,
      driverId: result.Driver.driverId,
      constructorId: result.Constructor.constructorId,
      position: Number(result.position),
      q1: result.Q1 ?? null,
      q2: result.Q2 ?? null,
      q3: result.Q3 ?? null,
    })),
  );

  const stats = await syncRows({
    incoming,
    existing: await db
      .select()
      .from(qualifyingResults)
      .where(like(qualifyingResults.raceId, `${season}-%`)),
    insert: (rows) => db.insert(qualifyingResults).values(rows).then(),
    update: ({ id, ...rest }) =>
      db
        .update(qualifyingResults)
        .set({ ...rest, updatedAt: new Date() })
        .where(eq(qualifyingResults.id, id))
        .then(),
  });

  await recordPayloadHash(resource, hash);
  return { label: 'qualifications', status: 'synced', stats };
}

async function syncDriverStandings(season: number): Promise<ResourceOutcome> {
  const label = 'classement pilotes';
  const payload = await fetchDriverStandings(season);
  if (!payload) return { label, status: 'synced', stats: { created: 0, updated: 0, skipped: 0 } };

  const hash = sha256(payload);
  const resource = `driverstandings:${season}`;
  if (await payloadUnchanged(resource, hash)) return { label, status: 'unchanged' };

  const incoming = payload.standings.flatMap((standing) => {
    const position = Number(standing.position ?? standing.positionText);
    // L'écurie courante est la dernière de la liste (cas des transferts en saison).
    const constructorId = standing.Constructors.at(-1)?.constructorId;
    if (!Number.isFinite(position) || !constructorId) return [];
    return [
      {
        id: `${season}-${payload.round}-${standing.Driver.driverId}`,
        season,
        round: payload.round,
        driverId: standing.Driver.driverId,
        constructorId,
        position,
        points: Number(standing.points),
        wins: Number(standing.wins),
      },
    ];
  });

  const stats = await syncRows({
    incoming,
    existing: await db
      .select()
      .from(driverStandings)
      .where(and(eq(driverStandings.season, season), eq(driverStandings.round, payload.round))),
    insert: (rows) => db.insert(driverStandings).values(rows).then(),
    update: ({ id, ...rest }) =>
      db
        .update(driverStandings)
        .set({ ...rest, updatedAt: new Date() })
        .where(eq(driverStandings.id, id))
        .then(),
  });

  await recordPayloadHash(resource, hash);
  return { label, status: 'synced', stats };
}

async function syncConstructorStandings(season: number): Promise<ResourceOutcome> {
  const label = 'classement constructeurs';
  const payload = await fetchConstructorStandings(season);
  if (!payload) return { label, status: 'synced', stats: { created: 0, updated: 0, skipped: 0 } };

  const hash = sha256(payload);
  const resource = `constructorstandings:${season}`;
  if (await payloadUnchanged(resource, hash)) return { label, status: 'unchanged' };

  const incoming = payload.standings.flatMap((standing) => {
    const position = Number(standing.position ?? standing.positionText);
    if (!Number.isFinite(position)) return [];
    return [
      {
        id: `${season}-${payload.round}-${standing.Constructor.constructorId}`,
        season,
        round: payload.round,
        constructorId: standing.Constructor.constructorId,
        position,
        points: Number(standing.points),
        wins: Number(standing.wins),
      },
    ];
  });

  const stats = await syncRows({
    incoming,
    existing: await db
      .select()
      .from(constructorStandings)
      .where(
        and(eq(constructorStandings.season, season), eq(constructorStandings.round, payload.round)),
      ),
    insert: (rows) => db.insert(constructorStandings).values(rows).then(),
    update: ({ id, ...rest }) =>
      db
        .update(constructorStandings)
        .set({ ...rest, updatedAt: new Date() })
        .where(eq(constructorStandings.id, id))
        .then(),
  });

  await recordPayloadHash(resource, hash);
  return { label, status: 'synced', stats };
}

// --- Rapport ---

function buildSummary(season: number, scope: string, outcomes: ResourceOutcome[]): string {
  const lines = [
    `## Sync F1 — saison ${season} (scope: ${scope})`,
    '',
    '| Ressource | Créés | Mis à jour | Inchangés |',
    '| --- | ---: | ---: | ---: |',
  ];
  for (const outcome of outcomes) {
    if (outcome.status === 'unchanged') {
      lines.push(`| ${outcome.label} | — | — | payload identique |`);
    } else {
      const { created, updated, skipped } = outcome.stats;
      lines.push(`| ${outcome.label} | ${created} | ${updated} | ${skipped} |`);
    }
  }
  return lines.join('\n');
}

function writeSummary(markdown: string): void {
  console.log(`\n${markdown}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
  }
}

// --- Point d'entrée ---

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      scope: { type: 'string', default: 'all' },
      season: { type: 'string' },
    },
  });

  const scope = values.scope as string;
  if (!['core', 'results', 'all'].includes(scope)) {
    throw new Error(`Scope invalide: "${scope}" (attendu: core, results ou all)`);
  }
  const season = values.season ? Number(values.season) : new Date().getFullYear();
  if (!Number.isInteger(season)) {
    throw new Error(`Saison invalide: "${values.season}"`);
  }

  console.log(`Sync F1 saison ${season}, scope "${scope}"...`);
  const outcomes: ResourceOutcome[] = [];

  // Le socle est toujours synchronisé en premier : les résultats et
  // classements le référencent par clés étrangères.
  outcomes.push(...(await syncCalendar(season)));
  outcomes.push(await syncDrivers(season));
  outcomes.push(await syncConstructors(season));

  if (scope !== 'core') {
    outcomes.push(await syncRaceResults(season));
    outcomes.push(await syncQualifying(season));
    outcomes.push(await syncDriverStandings(season));
    outcomes.push(await syncConstructorStandings(season));
  }

  writeSummary(buildSummary(season, scope, outcomes));
}

main().catch((err) => {
  console.error('Échec de la synchronisation F1 :', err);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## Sync F1 — échec\n\n\`\`\`\n${err instanceof Error ? err.message : String(err)}\n\`\`\`\n`,
    );
  }
  process.exit(1);
});

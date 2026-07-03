import { and, eq, inArray, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

import { db } from '@/lib/db/client';
import {
  circuits,
  // Ne jamais projeter cette table sous la clé "constructor" dans un
  // `.select({ ... })` Drizzle : ça collisionne avec la propriété
  // `Object.prototype.constructor` et casse le mapping de résultat (a fait
  // planter /api/f1/standings en 503 lors de la revue de code). Toujours
  // utiliser un alias comme "team".
  constructors,
  constructorStandings,
  driverStandings,
  drivers,
  races,
  raceResults,
} from '@/lib/db/schema';
import type {
  ConstructorStandingEntry,
  DriverStandingEntry,
  RaceWithCircuit,
  Standings,
} from '@/lib/f1/types';
import type { Constructor, Driver } from '@/lib/db/schema';

// Les données ne changent qu'après un sync programmé (quotidien/hebdo, voir
// docs/f1-data-stack.md) : une revalidation longue est sûre. Mise en cache au
// niveau de la fonction de requête (pas du Route Handler) car les handlers
// lisent `request.url`/searchParams, ce qui les force de toute façon en rendu
// dynamique — seul `unstable_cache` ici réduit réellement les allers-retours
// vers Neon.
const REVALIDATE_SECONDS = 21600; // 6h

/** Dernière saison présente en base (calendrier synchronisé le plus récent). */
async function getLatestSeasonUncached(): Promise<number | null> {
  const [row] = await db.select({ season: sql<number>`max(${races.season})` }).from(races);
  return row?.season ?? null;
}

const getLatestSeason = unstable_cache(getLatestSeasonUncached, ['f1-latest-season'], {
  revalidate: REVALIDATE_SECONDS,
});

async function getCalendarUncached(season?: number): Promise<RaceWithCircuit[]> {
  const targetSeason = season ?? (await getLatestSeason());
  if (targetSeason === null) return [];

  const rows = await db
    .select({ race: races, circuit: circuits })
    .from(races)
    .innerJoin(circuits, eq(races.circuitId, circuits.id))
    .where(eq(races.season, targetSeason))
    .orderBy(races.round);

  return rows.map(({ race, circuit }) => ({ ...race, circuit }));
}

export const getCalendar = unstable_cache(getCalendarUncached, ['f1-calendar'], {
  revalidate: REVALIDATE_SECONDS,
});

async function getDriversUncached(season?: number): Promise<Driver[]> {
  const targetSeason = season ?? (await getLatestSeason());
  if (targetSeason === null) return [];

  // Sous-requête plutôt que `selectDistinctOn` : DISTINCT ON impose que
  // l'ORDER BY commence par la colonne de dédoublonnage (drivers.id), ce qui
  // triait le résultat par id interne au lieu du nom. Ici, on ne
  // déduplique/filtre qu'une liste d'ids, puis on trie librement les lignes
  // `drivers` complètes par nom de famille.
  const driverIdsForSeason = db
    .selectDistinct({ id: raceResults.driverId })
    .from(raceResults)
    .innerJoin(races, eq(races.id, raceResults.raceId))
    .where(eq(races.season, targetSeason));

  return db
    .select()
    .from(drivers)
    .where(inArray(drivers.id, driverIdsForSeason))
    .orderBy(drivers.lastName);
}

export const getDrivers = unstable_cache(getDriversUncached, ['f1-drivers'], {
  revalidate: REVALIDATE_SECONDS,
});

async function getDriverByIdUncached(id: string): Promise<Driver | null> {
  const [row] = await db.select().from(drivers).where(eq(drivers.id, id)).limit(1);
  return row ?? null;
}

export const getDriverById = unstable_cache(getDriverByIdUncached, ['f1-driver-by-id'], {
  revalidate: REVALIDATE_SECONDS,
});

async function getTeamsUncached(season?: number): Promise<Constructor[]> {
  const targetSeason = season ?? (await getLatestSeason());
  if (targetSeason === null) return [];

  const constructorIdsForSeason = db
    .selectDistinct({ id: raceResults.constructorId })
    .from(raceResults)
    .innerJoin(races, eq(races.id, raceResults.raceId))
    .where(eq(races.season, targetSeason));

  return db
    .select()
    .from(constructors)
    .where(inArray(constructors.id, constructorIdsForSeason))
    .orderBy(constructors.name);
}

export const getTeams = unstable_cache(getTeamsUncached, ['f1-teams'], {
  revalidate: REVALIDATE_SECONDS,
});

async function getTeamByIdUncached(id: string): Promise<Constructor | null> {
  const [row] = await db.select().from(constructors).where(eq(constructors.id, id)).limit(1);
  return row ?? null;
}

export const getTeamById = unstable_cache(getTeamByIdUncached, ['f1-team-by-id'], {
  revalidate: REVALIDATE_SECONDS,
});

async function getStandingsUncached(season?: number): Promise<Standings | null> {
  const targetSeason = season ?? (await getLatestSeason());
  if (targetSeason === null) return null;

  // Pilotes et écuries sont synchronisés par deux appels indépendants
  // (scripts/sync-f1.ts) : leur round respectif peut diverger si l'un des
  // deux échoue. On les calcule donc séparément (jamais fusionnés sous un
  // round unique, voir lib/f1/types.ts) et en parallèle : ce sont deux
  // requêtes indépendantes, et chaque `await` est un aller-retour HTTP
  // complet sur le driver neon-http (pas de connexion poolée).
  const [[driverRoundRow], [constructorRoundRow]] = await Promise.all([
    db
      .select({ round: sql<number>`max(${driverStandings.round})` })
      .from(driverStandings)
      .where(eq(driverStandings.season, targetSeason)),
    db
      .select({ round: sql<number>`max(${constructorStandings.round})` })
      .from(constructorStandings)
      .where(eq(constructorStandings.season, targetSeason)),
  ]);

  const driverRound = driverRoundRow?.round ?? null;
  const constructorRound = constructorRoundRow?.round ?? null;
  if (driverRound === null && constructorRound === null) return null;

  const [driverRows, constructorRows] = await Promise.all([
    driverRound === null
      ? Promise.resolve([])
      : db
          .select({ standing: driverStandings, driver: drivers, team: constructors })
          .from(driverStandings)
          .innerJoin(drivers, eq(drivers.id, driverStandings.driverId))
          .innerJoin(constructors, eq(constructors.id, driverStandings.constructorId))
          .where(
            and(eq(driverStandings.season, targetSeason), eq(driverStandings.round, driverRound)),
          )
          .orderBy(driverStandings.position),
    constructorRound === null
      ? Promise.resolve([])
      : db
          .select({ standing: constructorStandings, team: constructors })
          .from(constructorStandings)
          .innerJoin(constructors, eq(constructors.id, constructorStandings.constructorId))
          .where(
            and(
              eq(constructorStandings.season, targetSeason),
              eq(constructorStandings.round, constructorRound),
            ),
          )
          .orderBy(constructorStandings.position),
  ]);

  const driverEntries: DriverStandingEntry[] = driverRows.map(({ standing, driver, team }) => ({
    season: standing.season,
    round: standing.round,
    position: standing.position,
    points: standing.points,
    wins: standing.wins,
    driver,
    constructor: team,
  }));

  const constructorEntries: ConstructorStandingEntry[] = constructorRows.map(
    ({ standing, team }) => ({
      season: standing.season,
      round: standing.round,
      position: standing.position,
      points: standing.points,
      wins: standing.wins,
      constructor: team,
    }),
  );

  return {
    season: targetSeason,
    driverRound,
    constructorRound,
    drivers: driverEntries,
    constructors: constructorEntries,
  };
}

export const getStandings = unstable_cache(getStandingsUncached, ['f1-standings'], {
  revalidate: REVALIDATE_SECONDS,
});

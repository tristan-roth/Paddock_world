import {
  boolean,
  date,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

export const circuits = pgTable('circuits', {
  id: text('id').primaryKey(), // circuitId Jolpica (ex: "monaco")
  name: text('name').notNull(),
  locality: text('locality').notNull(),
  country: text('country').notNull(),
  continent: text('continent'), // Europe / Asie / Amériques / Moyen-Orient
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const races = pgTable(
  'races',
  {
    id: text('id').primaryKey(), // `${season}-${round}`
    season: integer('season').notNull(),
    round: integer('round').notNull(),
    circuitId: text('circuit_id')
      .notNull()
      .references(() => circuits.id),
    name: text('name').notNull(), // nom du Grand Prix
    date: date('date').notNull(),
    sprintWeekend: boolean('sprint_weekend').notNull().default(false),
    lengthKm: real('length_km'),
    laps: integer('laps'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('races_season_round_unique').on(table.season, table.round)],
);

export const drivers = pgTable('drivers', {
  id: text('id').primaryKey(), // driverId Jolpica (ex: "verstappen")
  code: text('code'), // ex: VER
  number: integer('number'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  nationality: text('nationality').notNull(),
  dateOfBirth: date('date_of_birth'),
  placeOfBirth: text('place_of_birth'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const constructors = pgTable('constructors', {
  id: text('id').primaryKey(), // constructorId Jolpica (ex: "red_bull")
  name: text('name').notNull(),
  nationality: text('nationality').notNull(),
  color: text('color'), // couleur écurie (hex), renseignée manuellement (absente de l'API)
  engineSupplier: text('engine_supplier'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const driverStandings = pgTable(
  'driver_standings',
  {
    id: text('id').primaryKey(), // `${season}-${round}-${driverId}`
    season: integer('season').notNull(),
    round: integer('round').notNull(),
    driverId: text('driver_id')
      .notNull()
      .references(() => drivers.id),
    constructorId: text('constructor_id')
      .notNull()
      .references(() => constructors.id),
    position: integer('position').notNull(),
    points: real('points').notNull(),
    wins: integer('wins').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('driver_standings_season_round_driver_unique').on(
      table.season,
      table.round,
      table.driverId,
    ),
  ],
);

export const constructorStandings = pgTable(
  'constructor_standings',
  {
    id: text('id').primaryKey(), // `${season}-${round}-${constructorId}`
    season: integer('season').notNull(),
    round: integer('round').notNull(),
    constructorId: text('constructor_id')
      .notNull()
      .references(() => constructors.id),
    position: integer('position').notNull(),
    points: real('points').notNull(),
    wins: integer('wins').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('constructor_standings_season_round_constructor_unique').on(
      table.season,
      table.round,
      table.constructorId,
    ),
  ],
);

export const raceResults = pgTable(
  'race_results',
  {
    id: text('id').primaryKey(), // `${raceId}-${driverId}`
    raceId: text('race_id')
      .notNull()
      .references(() => races.id),
    driverId: text('driver_id')
      .notNull()
      .references(() => drivers.id),
    constructorId: text('constructor_id')
      .notNull()
      .references(() => constructors.id),
    grid: integer('grid'),
    position: integer('position'),
    positionText: text('position_text'), // "R" (retired), "DNF", "DSQ"...
    points: real('points').notNull().default(0),
    status: text('status'), // "Finished", "+1 Lap", "Retired"...
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('race_results_race_driver_unique').on(table.raceId, table.driverId)],
);

export const qualifyingResults = pgTable(
  'qualifying_results',
  {
    id: text('id').primaryKey(), // `${raceId}-${driverId}`
    raceId: text('race_id')
      .notNull()
      .references(() => races.id),
    driverId: text('driver_id')
      .notNull()
      .references(() => drivers.id),
    constructorId: text('constructor_id')
      .notNull()
      .references(() => constructors.id),
    position: integer('position').notNull(),
    q1: text('q1'), // temps au format "1:23.456"
    q2: text('q2'),
    q3: text('q3'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('qualifying_results_race_driver_unique').on(table.raceId, table.driverId)],
);

// Hash du dernier payload ingéré par ressource (ex: "results:2026") pour
// permettre au script de sync de sauter les écritures quand rien n'a changé.
export const syncState = pgTable('sync_state', {
  resource: text('resource').primaryKey(),
  payloadHash: text('payload_hash').notNull(),
  syncedAt: timestamp('synced_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Circuit = typeof circuits.$inferSelect;
export type Race = typeof races.$inferSelect;
export type Driver = typeof drivers.$inferSelect;
export type Constructor = typeof constructors.$inferSelect;
export type DriverStanding = typeof driverStandings.$inferSelect;
export type ConstructorStanding = typeof constructorStandings.$inferSelect;
export type RaceResult = typeof raceResults.$inferSelect;
export type QualifyingResult = typeof qualifyingResults.$inferSelect;
export type SyncState = typeof syncState.$inferSelect;

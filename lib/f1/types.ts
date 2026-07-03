import type { Circuit, Constructor, Driver, Race } from '@/lib/db/schema';

// Types de réponse exposés par les Route Handlers (app/api/f1/**).
// Composent les types de table bruts (schema.ts) avec les jointures
// nécessaires aux pages du site — jamais les types de table seuls,
// pour ne pas faire fuiter les FK internes (circuitId, driverId, ...)
// sans le nom lisible correspondant.

export interface RaceWithCircuit extends Race {
  circuit: Circuit;
}

export interface DriverStandingEntry {
  season: number;
  round: number;
  position: number;
  points: number;
  wins: number;
  driver: Driver;
  constructor: Constructor;
}

export interface ConstructorStandingEntry {
  season: number;
  round: number;
  position: number;
  points: number;
  wins: number;
  constructor: Constructor;
}

export interface Standings {
  season: number;
  // Séparés (plutôt qu'un seul `round`) car pilotes et écuries sont
  // synchronisés par deux appels indépendants (scripts/sync-f1.ts) : en cas
  // d'échec partiel du sync, ces deux rounds peuvent diverger. Les exposer
  // séparément rend l'éventuel décalage visible côté client au lieu de le
  // masquer sous une valeur unique.
  driverRound: number | null;
  constructorRound: number | null;
  drivers: DriverStandingEntry[];
  constructors: ConstructorStandingEntry[];
}

export interface ApiError {
  error: string;
}

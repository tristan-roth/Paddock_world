/**
 * Client Jolpica-F1 (API compatible Ergast) — https://api.jolpi.ca
 *
 * Seul composant du projet autorisé à parler à l'API F1 externe :
 * le site lit exclusivement la BD Neon alimentée par scripts/sync-f1.ts.
 *
 * Rate limits Jolpica (non authentifié) : 4 req/s en burst, 500 req/h soutenu.
 * Le client espace donc les requêtes et retente avec backoff exponentiel sur 429/5xx.
 */

const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

/** Espacement minimum entre deux requêtes (~2,8 req/s, sous la limite de 4 req/s). */
const MIN_REQUEST_INTERVAL_MS = 350;
/** Taille de page maximale acceptée par l'API. */
const PAGE_LIMIT = 100;
const MAX_RETRIES = 4;

// --- Types de réponse (sous-ensemble utile du format Ergast) ---

export interface JolpicaLocation {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

export interface JolpicaCircuit {
  circuitId: string;
  circuitName: string;
  Location: JolpicaLocation;
}

export interface JolpicaDriver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  givenName: string;
  familyName: string;
  dateOfBirth?: string;
  nationality: string;
}

export interface JolpicaConstructor {
  constructorId: string;
  name: string;
  nationality: string;
}

export interface JolpicaSession {
  date: string;
  time?: string;
}

export interface JolpicaRace {
  season: string;
  round: string;
  raceName: string;
  Circuit: JolpicaCircuit;
  date: string;
  time?: string;
  Sprint?: JolpicaSession;
}

export interface JolpicaRaceResult {
  position: string;
  positionText: string;
  points: string;
  grid: string;
  laps: string;
  status: string;
  Driver: JolpicaDriver;
  Constructor: JolpicaConstructor;
}

export interface JolpicaRaceWithResults extends JolpicaRace {
  Results: JolpicaRaceResult[];
}

export interface JolpicaQualifyingResult {
  position: string;
  Driver: JolpicaDriver;
  Constructor: JolpicaConstructor;
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

export interface JolpicaRaceWithQualifying extends JolpicaRace {
  QualifyingResults: JolpicaQualifyingResult[];
}

export interface JolpicaDriverStanding {
  position?: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: JolpicaDriver;
  Constructors: JolpicaConstructor[];
}

export interface JolpicaConstructorStanding {
  position?: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: JolpicaConstructor;
}

interface StandingsList<T> {
  season: string;
  round: string;
  DriverStandings?: T[];
  ConstructorStandings?: T[];
}

interface MRData {
  total: string;
  limit: string;
  offset: string;
  RaceTable?: { Races: JolpicaRace[] };
  DriverTable?: { Drivers: JolpicaDriver[] };
  ConstructorTable?: { Constructors: JolpicaConstructor[] };
  StandingsTable?: {
    StandingsLists: StandingsList<JolpicaDriverStanding | JolpicaConstructorStanding>[];
  };
}

// --- Requêtes espacées + retry ---

let lastRequestAt = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttledFetch(url: string): Promise<MRData> {
  for (let attempt = 0; ; attempt++) {
    const wait = lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();

    let response: Response;
    try {
      response = await fetch(url, { headers: { Accept: 'application/json' } });
    } catch (err) {
      // Erreur réseau (DNS, timeout...) : on retente comme un 5xx.
      if (attempt >= MAX_RETRIES) {
        throw new Error(`Jolpica injoignable après ${MAX_RETRIES + 1} tentatives: ${url}`, {
          cause: err,
        });
      }
      await sleep(backoffDelay(attempt, null));
      continue;
    }

    if (response.ok) {
      const body = (await response.json()) as { MRData: MRData };
      return body.MRData;
    }

    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt >= MAX_RETRIES) {
      throw new Error(`Jolpica a répondu ${response.status} pour ${url}`);
    }
    await sleep(backoffDelay(attempt, response.headers.get('retry-after')));
  }
}

function backoffDelay(attempt: number, retryAfterHeader: string | null): number {
  const retryAfter = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 0;
  const exponential = 1000 * 2 ** attempt + Math.random() * 500;
  return Math.max(retryAfter, exponential);
}

/** Agrège toutes les pages d'un endpoint paginé. */
async function fetchAllPages<T>(path: string, extract: (data: MRData) => T[]): Promise<T[]> {
  const items: T[] = [];
  for (let offset = 0; ; offset += PAGE_LIMIT) {
    const data = await throttledFetch(`${BASE_URL}/${path}?limit=${PAGE_LIMIT}&offset=${offset}`);
    items.push(...extract(data));
    if (offset + PAGE_LIMIT >= Number(data.total)) return items;
  }
}

// --- Endpoints publics ---

/** Calendrier d'une saison (courses + circuits). */
export function fetchCalendar(season: number): Promise<JolpicaRace[]> {
  return fetchAllPages(`${season}/races/`, (data) => data.RaceTable?.Races ?? []);
}

/** Pilotes engagés sur une saison. */
export function fetchDrivers(season: number): Promise<JolpicaDriver[]> {
  return fetchAllPages(`${season}/drivers/`, (data) => data.DriverTable?.Drivers ?? []);
}

/** Écuries engagées sur une saison. */
export function fetchConstructors(season: number): Promise<JolpicaConstructor[]> {
  return fetchAllPages(
    `${season}/constructors/`,
    (data) => data.ConstructorTable?.Constructors ?? [],
  );
}

/** Résultats de course de toutes les manches disputées d'une saison. */
export function fetchRaceResults(season: number): Promise<JolpicaRaceWithResults[]> {
  return fetchGroupedByRound<JolpicaRaceWithResults>(`${season}/results/`, (race, extra) => ({
    ...race,
    Results: [...race.Results, ...(extra as JolpicaRaceWithResults).Results],
  }));
}

/** Résultats de qualification de toutes les manches disputées d'une saison. */
export function fetchQualifyingResults(season: number): Promise<JolpicaRaceWithQualifying[]> {
  return fetchGroupedByRound<JolpicaRaceWithQualifying>(`${season}/qualifying/`, (race, extra) => ({
    ...race,
    QualifyingResults: [
      ...race.QualifyingResults,
      ...(extra as JolpicaRaceWithQualifying).QualifyingResults,
    ],
  }));
}

/**
 * Les endpoints results/qualifying paginent au niveau des lignes : une même course
 * peut être scindée sur deux pages. On fusionne donc par (season, round).
 */
async function fetchGroupedByRound<T extends JolpicaRace>(
  path: string,
  merge: (existing: T, incoming: T) => T,
): Promise<T[]> {
  const races = await fetchAllPages(path, (data) => (data.RaceTable?.Races ?? []) as T[]);
  const byRound = new Map<string, T>();
  for (const race of races) {
    const key = `${race.season}-${race.round}`;
    const existing = byRound.get(key);
    byRound.set(key, existing ? merge(existing, race) : race);
  }
  return [...byRound.values()];
}

/** Classement pilotes courant d'une saison (avec le round auquel il correspond). */
export async function fetchDriverStandings(
  season: number,
): Promise<{ round: number; standings: JolpicaDriverStanding[] } | null> {
  const data = await throttledFetch(`${BASE_URL}/${season}/driverstandings/?limit=${PAGE_LIMIT}`);
  const list = data.StandingsTable?.StandingsLists[0];
  if (!list) return null;
  return {
    round: Number(list.round),
    standings: (list.DriverStandings ?? []) as JolpicaDriverStanding[],
  };
}

/** Classement constructeurs courant d'une saison (avec le round auquel il correspond). */
export async function fetchConstructorStandings(
  season: number,
): Promise<{ round: number; standings: JolpicaConstructorStanding[] } | null> {
  const data = await throttledFetch(
    `${BASE_URL}/${season}/constructorstandings/?limit=${PAGE_LIMIT}`,
  );
  const list = data.StandingsTable?.StandingsLists[0];
  if (!list) return null;
  return {
    round: Number(list.round),
    standings: (list.ConstructorStandings ?? []) as JolpicaConstructorStanding[],
  };
}

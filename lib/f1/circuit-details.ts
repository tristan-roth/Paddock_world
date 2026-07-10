/**
 * Données circuits absentes de l'API Jolpica, curatées manuellement depuis
 * les fiches officielles F1 : continent (pour le filtre calendrier),
 * longueur du tracé et nombre de tours de la distance de course standard.
 *
 * Consommé par scripts/sync-f1.ts lors du sync du calendrier : les champs
 * sont écrits en BD (circuits.continent, races.lengthKm, races.laps) et le
 * hash de détection de changement inclut ce module — modifier une valeur
 * ici déclenche une resynchronisation.
 *
 * Clé = circuitId Jolpica/Ergast. Un circuit absent de cette table est
 * simplement synchronisé sans ces champs (ils restent NULL en BD et
 * s'affichent "—" côté site).
 */

export type Continent = 'Europe' | 'Asie' | 'Amériques' | 'Moyen-Orient' | 'Océanie';

export interface CircuitDetails {
  continent: Continent;
  /** Longueur du tracé en km. */
  lengthKm: number;
  /** Tours de la distance de course standard (hors sprint). */
  laps: number;
}

export const CIRCUIT_DETAILS: Record<string, CircuitDetails> = {
  albert_park: { continent: 'Océanie', lengthKm: 5.278, laps: 58 },
  shanghai: { continent: 'Asie', lengthKm: 5.451, laps: 56 },
  suzuka: { continent: 'Asie', lengthKm: 5.807, laps: 53 },
  bahrain: { continent: 'Moyen-Orient', lengthKm: 5.412, laps: 57 },
  jeddah: { continent: 'Moyen-Orient', lengthKm: 6.174, laps: 50 },
  miami: { continent: 'Amériques', lengthKm: 5.412, laps: 57 },
  imola: { continent: 'Europe', lengthKm: 4.909, laps: 63 },
  monaco: { continent: 'Europe', lengthKm: 3.337, laps: 78 },
  catalunya: { continent: 'Europe', lengthKm: 4.657, laps: 66 },
  villeneuve: { continent: 'Amériques', lengthKm: 4.361, laps: 70 },
  red_bull_ring: { continent: 'Europe', lengthKm: 4.318, laps: 71 },
  silverstone: { continent: 'Europe', lengthKm: 5.891, laps: 52 },
  spa: { continent: 'Europe', lengthKm: 7.004, laps: 44 },
  hungaroring: { continent: 'Europe', lengthKm: 4.381, laps: 70 },
  zandvoort: { continent: 'Europe', lengthKm: 4.259, laps: 72 },
  monza: { continent: 'Europe', lengthKm: 5.793, laps: 53 },
  // Nouveau tracé madrilène 2026 — chiffres provisoires annoncés par la F1.
  madring: { continent: 'Europe', lengthKm: 5.474, laps: 57 },
  baku: { continent: 'Europe', lengthKm: 6.003, laps: 51 },
  marina_bay: { continent: 'Asie', lengthKm: 4.94, laps: 62 },
  americas: { continent: 'Amériques', lengthKm: 5.513, laps: 56 },
  rodriguez: { continent: 'Amériques', lengthKm: 4.304, laps: 71 },
  interlagos: { continent: 'Amériques', lengthKm: 4.309, laps: 71 },
  vegas: { continent: 'Amériques', lengthKm: 6.201, laps: 50 },
  losail: { continent: 'Moyen-Orient', lengthKm: 5.419, laps: 57 },
  yas_marina: { continent: 'Moyen-Orient', lengthKm: 5.281, laps: 58 },
};

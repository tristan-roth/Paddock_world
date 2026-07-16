// Correspondance démonyme Jolpica → code pays ISO 3166-1 alpha-2, pour
// afficher les drapeaux des pilotes/écuries (page standings, issue #6).
// Jolpica ne fournit que la nationalité en toutes lettres ("British",
// "Monegasque", ...) — jamais de code pays.
const NATIONALITY_TO_ISO: Record<string, string> = {
  American: 'us',
  Argentine: 'ar',
  Argentinian: 'ar',
  Australian: 'au',
  Austrian: 'at',
  Azerbaijani: 'az',
  Bahraini: 'bh',
  Belgian: 'be',
  Brazilian: 'br',
  British: 'gb',
  Canadian: 'ca',
  Chilean: 'cl',
  Chinese: 'cn',
  Colombian: 'co',
  Czech: 'cz',
  Danish: 'dk',
  Dutch: 'nl',
  Emirati: 'ae',
  Estonian: 'ee',
  Finnish: 'fi',
  French: 'fr',
  German: 'de',
  Hungarian: 'hu',
  Indian: 'in',
  Indonesian: 'id',
  Irish: 'ie',
  Israeli: 'il',
  Italian: 'it',
  Japanese: 'jp',
  Korean: 'kr',
  Liechtensteiner: 'li',
  Malaysian: 'my',
  Mexican: 'mx',
  Monegasque: 'mc',
  'New Zealander': 'nz',
  Norwegian: 'no',
  Polish: 'pl',
  Portuguese: 'pt',
  Qatari: 'qa',
  Russian: 'ru',
  Saudi: 'sa',
  Singaporean: 'sg',
  'South African': 'za',
  Spanish: 'es',
  Swedish: 'se',
  Swiss: 'ch',
  Thai: 'th',
  Turkish: 'tr',
  Ukrainian: 'ua',
  Uruguayan: 'uy',
  Venezuelan: 've',
  Vietnamese: 'vn',
};

/**
 * URL du drapeau (PNG 40px, flagcdn.com) pour un démonyme Jolpica, ou `null`
 * si la nationalité est inconnue/absente (pilotes de réserve, cf. schema.ts).
 * Images plutôt qu'emoji : Chrome/Edge sous Windows ne rend pas les emoji
 * drapeaux (affiche les lettres de l'indicateur régional).
 */
export function flagUrl(nationality: string | null | undefined): string | null {
  if (!nationality) return null;
  const iso = NATIONALITY_TO_ISO[nationality];
  return iso ? `https://flagcdn.com/w40/${iso}.png` : null;
}

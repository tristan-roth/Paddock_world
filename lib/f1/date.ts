/**
 * Formatage de dates partagé entre la page Championship (board + fiches
 * circuit) et le widget NextRace (spotlight + countdown) — voir issues #2/#3.
 */

/** yyyy-mm-dd local, comparable directement aux dates ISO de l'API. */
export function todayISO(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${mm}-${dd}`
}

export function formatShortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    .toUpperCase()
}

export function formatFullDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

import { NextResponse } from "next/server";

import type { ApiError } from "@/lib/f1/types";

/** BD Neon indisponible ou requête en échec : ne jamais crasher, répondre 503 explicite. */
export function errorResponse(err: unknown): NextResponse<ApiError> {
  console.error("Erreur API F1 :", err);
  return NextResponse.json(
    { error: "Base de données indisponible" },
    { status: 503 },
  );
}

// Année à 4 chiffres stricte : rejette "", les espaces, les décimaux ("2026.5")
// et les literals numériques que Number() accepte silencieusement (hex "0x7e8",
// notation scientifique "2e3"...).
const SEASON_PATTERN = /^\d{4}$/;

/** Lit ?season= depuis l'URL ; undefined si absent, null si invalide. */
export function parseSeasonParam(request: Request): number | undefined | null {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("season");
  if (raw === null) return undefined;
  return SEASON_PATTERN.test(raw) ? Number(raw) : null;
}

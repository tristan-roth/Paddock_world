import { NextResponse } from 'next/server';

import { errorResponse, parseSeasonParam } from '@/lib/f1/http';
import { getStandings } from '@/lib/f1/queries';

export async function GET(request: Request) {
  const season = parseSeasonParam(request);
  if (season === null) {
    return NextResponse.json({ error: 'Paramètre season invalide' }, { status: 400 });
  }

  try {
    const standings = await getStandings(season);
    if (!standings) {
      return NextResponse.json({ error: 'Aucun classement disponible' }, { status: 404 });
    }
    return NextResponse.json(standings);
  } catch (err) {
    return errorResponse(err);
  }
}

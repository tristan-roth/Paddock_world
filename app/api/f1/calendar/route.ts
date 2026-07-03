import { NextResponse } from 'next/server';

import { errorResponse, parseSeasonParam } from '@/lib/f1/http';
import { getCalendar } from '@/lib/f1/queries';

export async function GET(request: Request) {
  const season = parseSeasonParam(request);
  if (season === null) {
    return NextResponse.json({ error: 'Paramètre season invalide' }, { status: 400 });
  }

  try {
    const races = await getCalendar(season);
    return NextResponse.json(races);
  } catch (err) {
    return errorResponse(err);
  }
}

import { NextResponse } from 'next/server';

import { errorResponse, parseSeasonParam } from '@/lib/f1/http';
import { getDrivers } from '@/lib/f1/queries';

export async function GET(request: Request) {
  const season = parseSeasonParam(request);
  if (season === null) {
    return NextResponse.json({ error: 'Paramètre season invalide' }, { status: 400 });
  }

  try {
    const drivers = await getDrivers(season);
    return NextResponse.json(drivers);
  } catch (err) {
    return errorResponse(err);
  }
}

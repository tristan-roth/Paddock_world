import { NextResponse } from 'next/server';

import { errorResponse } from '@/lib/f1/http';
import { getSeasons } from '@/lib/f1/queries';

export async function GET() {
  try {
    const seasons = await getSeasons();
    return NextResponse.json(seasons);
  } catch (err) {
    return errorResponse(err);
  }
}

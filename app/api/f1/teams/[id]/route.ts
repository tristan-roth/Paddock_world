import { NextResponse } from 'next/server';

import { errorResponse } from '@/lib/f1/http';
import { getTeamById } from '@/lib/f1/queries';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const team = await getTeamById(id);
    if (!team) {
      return NextResponse.json({ error: 'Écurie introuvable' }, { status: 404 });
    }
    return NextResponse.json(team);
  } catch (err) {
    return errorResponse(err);
  }
}

import { NextResponse } from 'next/server';

import { errorResponse } from '@/lib/f1/http';
import { getDriverById } from '@/lib/f1/queries';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const driver = await getDriverById(id);
    if (!driver) {
      return NextResponse.json({ error: 'Pilote introuvable' }, { status: 404 });
    }
    return NextResponse.json(driver);
  } catch (err) {
    return errorResponse(err);
  }
}

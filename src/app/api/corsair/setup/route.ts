import { NextResponse } from 'next/server';
import { ensureCorsairSetup } from '@/server/ensureCorsairSetup';

/**
 * GET /api/corsair/setup?secret=YOUR_MIGRATE_SECRET
 * Provisions corsair_integrations rows in production (one-time).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (!process.env.MIGRATE_SECRET || secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
  }

  if (!process.env.CORSAIR_KEK) {
    return NextResponse.json({ error: 'CORSAIR_KEK not configured' }, { status: 500 });
  }

  const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  try {
    await ensureCorsairSetup();
    return NextResponse.json({
      done: true,
      message: hasGoogle
        ? 'Corsair integrations provisioned with Google OAuth credentials'
        : 'Corsair integration rows created — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET for OAuth',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'corsair setup failed';
    console.error('[api/corsair/setup]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

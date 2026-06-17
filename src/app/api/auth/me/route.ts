import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';

/** Lightweight session probe for client UI (sidebar, connect prompts). */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    userId: session.userId,
    tenantId: session.tenantId,
    email: session.email,
  });
}

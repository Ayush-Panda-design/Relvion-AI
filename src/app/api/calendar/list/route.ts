import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const { searchParams } = new URL(req.url);
    const timeMin = searchParams.get('timeMin') || new Date().toISOString();

    // Fetch upcoming events from Google Calendar via Corsair
    const listRes = await corsair.googlecalendar.api.events.getMany({
      timeMin,
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = listRes?.items || [];
    return NextResponse.json({ events });
  } catch (e: any) {
    console.error('[calendar/list] API fetch failed:', e.message);
    return NextResponse.json({ events: [], error: e.message || 'Failed to fetch calendar events' });
  }
}
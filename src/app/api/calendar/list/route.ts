import { NextResponse } from 'next/server';
import { corsair } from '@/server/corsair';

export async function GET() {
  try {
    const d = new Date();
    // Fetch upcoming events from Google Calendar via Corsair
    const listRes = await (corsair as any).googlecalendar.api.events.list({
      timeMin: d.toISOString(),
      maxResults: 10,
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

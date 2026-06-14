import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { logActivity } from '@/lib/activityLog';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const { summary, description, startDateTime, endDateTime, attendees } = await req.json();

    if (!summary || !startDateTime || !endDateTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const event: Record<string, unknown> = {
      summary,
      description: description || '',
      start: { dateTime: startDateTime, timeZone: 'UTC' },
      end: { dateTime: endDateTime, timeZone: 'UTC' },
    };

    if (attendees && attendees.length > 0) {
      event.attendees = attendees
        .split(',')
        .map((e: string) => e.trim())
        .filter(Boolean)
        .map((email: string) => ({ email }));
    }

    const result = await corsair.googlecalendar.api.events.create({
      calendarId: 'primary',
      event,
      sendUpdates: event.attendees ? 'all' : 'none',
    });

    await logActivity('calendar_created', {
      eventId: result?.id,
      summary,
      attendeeCount: Array.isArray(event.attendees) ? event.attendees.length : 0,
    });

    return NextResponse.json({ success: true, event: result });
  } catch (error: any) {
    console.error('[calendar/create] error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

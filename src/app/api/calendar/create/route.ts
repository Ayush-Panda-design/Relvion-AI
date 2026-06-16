import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { logActivity } from '@/lib/activityLog';
import { buildGoogleEventPayload } from '@/lib/calendar-event';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const body = await req.json();
    const { summary, description, startDateTime, endDateTime, attendees, timeZone, allDay, recurrence } =
      body;

    if (!summary || !startDateTime || !endDateTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const event = buildGoogleEventPayload({
      summary,
      description,
      startDateTime,
      endDateTime,
      attendees,
      timeZone,
      allDay,
      recurrence,
    });

    const result = await corsair.googlecalendar.api.events.create({
      calendarId: 'primary',
      event,
      sendUpdates: event.attendees ? 'all' : 'none',
    });

    await logActivity('calendar_created', {
      eventId: result?.id,
      summary,
      attendeeCount: Array.isArray(event.attendees) ? event.attendees.length : 0,
      recurrence: recurrence || 'none',
    });

    return NextResponse.json({ success: true, event: result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'create failed';
    console.error('[calendar/create] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

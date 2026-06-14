import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { logActivity } from '@/lib/activityLog';

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const { id, summary, description, startDateTime, endDateTime, attendees } = await req.json();

    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const corsair = corsairForTenant(session.tenantId);

    if (!id) {
      return NextResponse.json({ error: 'Event id is required' }, { status: 400 });
    }

    const event: Record<string, unknown> = {};
    if (summary !== undefined) event.summary = summary;
    if (description !== undefined) event.description = description;
    if (startDateTime) event.start = { dateTime: startDateTime, timeZone: 'UTC' };
    if (endDateTime) event.end = { dateTime: endDateTime, timeZone: 'UTC' };
    if (attendees !== undefined) {
      event.attendees =
        typeof attendees === 'string'
          ? attendees
              .split(',')
              .map((e: string) => e.trim())
              .filter(Boolean)
              .map((email: string) => ({ email }))
          : attendees;
    }

    const result = await corsair.googlecalendar.api.events.update({
      calendarId: 'primary',
      id,
      event,
      sendUpdates: 'all',
    });

    await logActivity('calendar_updated', { eventId: id, summary: result?.summary || summary });

    return NextResponse.json({ success: true, event: result });
  } catch (error: any) {
    console.error('[calendar/update] error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

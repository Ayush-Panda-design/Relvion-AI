import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { logActivity } from '@/lib/activityLog';
import { buildGoogleEventPayload } from '@/lib/calendar-event';

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const { id, summary, description, startDateTime, endDateTime, attendees, timeZone, allDay, recurrence } =
      await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Event id is required' }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    if (summary !== undefined) patch.summary = summary;
    if (description !== undefined) patch.description = description;

    if (startDateTime && endDateTime) {
      const built = buildGoogleEventPayload({
        summary: summary || 'Event',
        description,
        startDateTime,
        endDateTime,
        timeZone,
        allDay,
        recurrence,
      });
      patch.start = built.start;
      patch.end = built.end;
      if (built.recurrence) patch.recurrence = built.recurrence;
    }

    if (attendees !== undefined) {
      patch.attendees =
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
      event: patch,
      sendUpdates: 'all',
    });

    await logActivity('calendar_updated', { eventId: id, summary: result?.summary || summary });

    return NextResponse.json({ success: true, event: result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'update failed';
    console.error('[calendar/update] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { logActivity } from '@/lib/activityLog';

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const { id } = await req.json();

    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const corsair = corsairForTenant(session.tenantId);

    if (!id) {
      return NextResponse.json({ error: 'Event id is required' }, { status: 400 });
    }

    await corsair.googlecalendar.api.events.delete({
      calendarId: 'primary',
      id,
      sendUpdates: 'all',
    });

    await logActivity('calendar_deleted', { eventId: id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[calendar/delete] error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

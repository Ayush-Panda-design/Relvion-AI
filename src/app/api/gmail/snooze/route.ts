import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { snoozeEmail, clearSnooze } from '@/server/services/snooze';

function resolveSnoozeUntil(preset?: string, until?: string): Date | null {
  if (until) {
    const d = new Date(until);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const now = new Date();
  switch (preset) {
    case 'later_today': {
      const d = new Date(now);
      d.setHours(18, 0, 0, 0);
      if (d <= now) d.setDate(d.getDate() + 1);
      return d;
    }
    case 'tomorrow': {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      d.setHours(8, 0, 0, 0);
      return d;
    }
    case 'next_week': {
      const d = new Date(now);
      d.setDate(d.getDate() + 7);
      d.setHours(8, 0, 0, 0);
      return d;
    }
    default:
      return null;
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { emailId, threadId, preset, until } = await req.json();
    if (!emailId) {
      return NextResponse.json({ error: 'Missing emailId' }, { status: 400 });
    }

    const snoozeUntil = resolveSnoozeUntil(preset, until);
    if (!snoozeUntil) {
      return NextResponse.json({ error: 'Invalid snooze time' }, { status: 400 });
    }

    const corsair = corsairForTenant(session.tenantId);
    await corsair.gmail.api.messages.modify({ id: emailId, removeLabelIds: ['INBOX'] });

    const row = await snoozeEmail(session.tenantId, emailId, threadId, snoozeUntil);
    return NextResponse.json({ success: true, snooze: row });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Snooze failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { emailId } = await req.json();
    if (!emailId) {
      return NextResponse.json({ error: 'Missing emailId' }, { status: 400 });
    }

    const corsair = corsairForTenant(session.tenantId);
    await corsair.gmail.api.messages.modify({ id: emailId, addLabelIds: ['INBOX'] });
    await clearSnooze(session.tenantId, emailId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unsnooze failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const corsair = corsairForTenant(session.tenantId);

    // Pull the latest 10 unread messages from Gmail
    const listRes = await (corsair as any).gmail.api.messages.list({
      q: 'is:unread in:inbox',
      maxResults: 10,
    });

    const messageIds: string[] = (listRes?.messages || []).map((m: any) => m.id);

    if (messageIds.length === 0) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = [];
    for (let i = 0; i < messageIds.length; i += 5) {
      const batch = messageIds.slice(i, i + 5);
      const msgs = await Promise.all(
        batch.map((id: string) =>
          (corsair as any).gmail.api.messages.get({ id, format: 'full' })
        )
      );
      for (const msg of msgs) {
        if (!msg) continue;
        const headers: any[] = msg.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

        const rawFrom = getHeader('From');
        // Parse "Name <email>" to just "Name"
        const fromMatch = rawFrom.match(/^([^<]+)</);
        const fromName = fromMatch ? fromMatch[1].trim() : rawFrom.replace(/[<>]/g, '').trim();

        notifications.push({
          id: msg.id,
          subject: getHeader('Subject') || '(no subject)',
          from: fromName || 'Unknown',
          date: getHeader('Date') || new Date().toISOString(),
          snippet: (msg.snippet || '').substring(0, 80),
        });
      }
    }

    return NextResponse.json({
      notifications,
      unreadCount: listRes?.resultSizeEstimate || notifications.length,
    });
  } catch (error: any) {
    console.error('[notifications] failed:', error.message);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

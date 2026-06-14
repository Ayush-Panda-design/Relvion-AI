import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });
    }

    switch (action) {
      case 'archive':
        await corsair.gmail.api.messages.modify({ id, removeLabelIds: ['INBOX'] });
        return NextResponse.json({ success: true, action: 'archived' });
      case 'trash':
        await corsair.gmail.api.messages.trash({ id });
        return NextResponse.json({ success: true, action: 'trashed' });
      case 'markRead':
        await corsair.gmail.api.messages.modify({ id, removeLabelIds: ['UNREAD'] });
        return NextResponse.json({ success: true, action: 'marked_read' });
      case 'star':
        await corsair.gmail.api.messages.modify({ id, addLabelIds: ['STARRED'] });
        return NextResponse.json({ success: true, action: 'starred' });
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[gmail/action] error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

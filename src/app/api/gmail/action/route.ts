import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { clearTenantCache } from '@/lib/tenant-cache';
import { clearGmailListCaches } from '@/lib/gmail/listFetch';

type GmailAction = 'archive' | 'trash' | 'markRead' | 'star';

async function runOne(corsair: ReturnType<typeof corsairForTenant>, id: string, action: GmailAction) {
  switch (action) {
    case 'archive':
      await corsair.gmail.api.messages.modify({ id, removeLabelIds: ['INBOX'] });
      return 'archived';
    case 'trash':
      await corsair.gmail.api.messages.trash({ id });
      return 'trashed';
    case 'markRead':
      await corsair.gmail.api.messages.modify({ id, removeLabelIds: ['UNREAD'] });
      return 'marked_read';
    case 'star':
      await corsair.gmail.api.messages.modify({ id, addLabelIds: ['STARRED'] });
      return 'starred';
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const body = await req.json();
    const { id, ids, action } = body as {
      id?: string;
      ids?: string[];
      action?: GmailAction;
    };

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    const targetIds = ids?.length ? ids : id ? [id] : [];
    if (targetIds.length === 0) {
      return NextResponse.json({ error: 'Missing id or ids' }, { status: 400 });
    }

    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const messageId of targetIds) {
      try {
        await runOne(corsair, messageId, action);
        results.push({ id: messageId, ok: true });
      } catch (err: unknown) {
        results.push({
          id: messageId,
          ok: false,
          error: err instanceof Error ? err.message : 'failed',
        });
      }
    }

    clearTenantCache(session.tenantId, 'gmail-label-counts');
    clearGmailListCaches(session.tenantId);

    const failed = results.filter((r) => !r.ok);
    return NextResponse.json({
      success: failed.length === 0,
      action,
      processed: results.length,
      results,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'action failed';
    console.error('[gmail/action] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

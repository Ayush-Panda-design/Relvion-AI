import { NextResponse } from 'next/server';
import { processIncomingMessage } from '@/server/services/gmailWebhookProcessor';

// Real webhook handler — delegates to shared processor
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log('[webhook/gmail] received:', JSON.stringify(payload).slice(0, 200));

    const msg = payload?.data?.message;
    if (!msg) return NextResponse.json({ success: true });

    const { priority } = await processIncomingMessage(msg);
    return NextResponse.json({ success: true, priority });
  } catch (error: any) {
    console.error('[webhook/gmail] error:', error.message);
    return NextResponse.json({ success: false, error: 'Webhook processing failed' }, { status: 500 });
  }
}

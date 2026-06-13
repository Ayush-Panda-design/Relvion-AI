import { NextResponse } from 'next/server';
import { broadcastEvent } from '@/lib/eventBus';

// Calendar webhook handler — logs event details and emits SSE broadcast
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const event = payload?.data?.event || payload?.event;

    if (event) {
      console.log('[webhook/calendar] event changed:', {
        id: event.id,
        summary: event.summary,
        status: event.status,
        start: event.start,
      });
    } else {
      console.log('[webhook/calendar] received:', JSON.stringify(payload).slice(0, 200));
    }

    // Broadcast realtime SSE event so the Calendar UI refreshes automatically
    broadcastEvent('CALENDAR_UPDATED', {
      eventId: event?.id,
      summary: event?.summary,
      status: event?.status,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[webhook/calendar] error:', error.message);
    return NextResponse.json({ success: false, error: 'Calendar webhook failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

// Real calendar webhook handler — logs and acknowledges
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

    return NextResponse.json({ success: true, message: 'Calendar webhook processed' });
  } catch (error: any) {
    console.error('[webhook/calendar] error:', error.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

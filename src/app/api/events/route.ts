import { eventBus } from '@/lib/eventBus';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Only allow authenticated users to subscribe to events
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection confirmation
      controller.enqueue(encoder.encode('data: {"type":"CONNECTED"}\n\n'));

      const listener = (event: { type: string; data?: unknown }) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Client disconnected
        }
      };

      eventBus.on('event', listener);

      // Heartbeat every 25s to keep connection alive through proxies
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25_000);

      // Cleanup when client disconnects
      req.signal.addEventListener('abort', () => {
        eventBus.off('event', listener);
        clearInterval(heartbeat);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

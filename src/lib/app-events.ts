'use client';

/** Single shared SSE connection for the whole dashboard. */

type AppEventHandler = (type: string) => void;

let eventSource: EventSource | null = null;
let refCount = 0;
const handlers = new Set<AppEventHandler>();

function ensureConnection() {
  if (eventSource) return;
  eventSource = new EventSource('/api/events');
  eventSource.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg?.type) {
        handlers.forEach((h) => h(msg.type));
      }
    } catch {
      /* ignore */
    }
  };
  eventSource.onerror = () => {
    /* browser auto-reconnects */
  };
}

function closeConnection() {
  if (refCount > 0) return;
  eventSource?.close();
  eventSource = null;
}

export function subscribeAppEvents(handler: AppEventHandler) {
  refCount += 1;
  ensureConnection();
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
    refCount = Math.max(0, refCount - 1);
    closeConnection();
  };
}

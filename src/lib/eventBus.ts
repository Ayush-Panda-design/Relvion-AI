/**
 * SSE Event Bus — broadcasts realtime events to all connected clients.
 * Singleton shared across the Next.js server process.
 */
import { EventEmitter } from 'events';

export type AppEventType =
  | 'EMAIL_RECEIVED'
  | 'EMAIL_UPDATED'
  | 'EMAIL_DELETED'
  | 'CALENDAR_UPDATED';

export interface AppEvent {
  type: AppEventType;
  data?: Record<string, unknown>;
}

class EventBus extends EventEmitter {}

// Global singleton — survives across requests in Next.js dev/prod
const globalKey = '__relvion_event_bus__';
const g = global as any;
if (!g[globalKey]) {
  g[globalKey] = new EventBus();
  g[globalKey].setMaxListeners(200);
}

export const eventBus: EventBus = g[globalKey];

export function broadcastEvent(type: AppEventType, data?: Record<string, unknown>) {
  eventBus.emit('event', { type, data } satisfies AppEvent);
}

import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { broadcastEvent } from '@/lib/eventBus';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

export type ActivityType =
  | 'email_sent'
  | 'email_received'
  | 'email_replied'
  | 'email_drafted'
  | 'calendar_created'
  | 'calendar_updated'
  | 'calendar_deleted';

export async function logActivity(
  eventType: ActivityType,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  try {
    await db.query(
      `INSERT INTO activity_log (id, event_type, metadata) VALUES ($1, $2, $3)`,
      [randomUUID(), eventType, JSON.stringify(metadata)]
    );
    broadcastEvent('ANALYTICS_UPDATED', { eventType });
  } catch (err) {
    console.error('[activityLog] failed:', err);
  }
}

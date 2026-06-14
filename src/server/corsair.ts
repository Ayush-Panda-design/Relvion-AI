// src/server/corsair.ts
import { Pool } from 'pg';
import { createCorsair } from 'corsair';
import { gmail } from '@corsair-dev/gmail';
import { googlecalendar } from '@corsair-dev/googlecalendar';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

export const corsair = createCorsair({
  plugins: [
    gmail({
      webhookHooks: {
        messageChanged: {
          before: async (ctx, payload) => {
            return { ctx, args: payload };
          },
          after: async (ctx, response) => {
            const type = response.data?.type;
            if (type === 'messageDeleted') {
              // Broadcast deletion so inbox removes the email
              try {
                const { broadcastEvent } = await import('@/lib/eventBus');
                broadcastEvent('EMAIL_DELETED', { emailId: response.data?.message?.id });
              } catch {}
              return;
            }

            const labelIds: string[] = response.data?.message?.labelIds ?? [];
            const msg = response.data?.message;

            if (labelIds.includes('INBOX')) {
              // New email or thread reply received — run full processing pipeline
              try {
                const { processIncomingMessage } = await import(
                  '@/server/services/gmailWebhookProcessor'
                );
                if (msg) {
                  await processIncomingMessage(msg);
                }
              } catch (e: any) {
                console.error('[corsair/gmail hook] processIncomingMessage failed:', e?.message);
              }
            } else if (labelIds.includes('DRAFT')) {
              console.log('[corsair/gmail] Draft saved/updated');
            } else if (labelIds.includes('SENT') && !labelIds.includes('INBOX')) {
              console.log('[corsair/gmail] Email sent');
            }
          },
        },
      },
    }),
    googlecalendar({
      webhookHooks: {
        eventChanged: {
          after: async (ctx, response) => {
            const event = response.data?.event;
            console.log('[corsair/calendar] event changed:', event?.summary);

            try {
              const { broadcastEvent } = await import('@/lib/eventBus');
              broadcastEvent('CALENDAR_UPDATED', {
                eventId: event?.id,
                summary: event?.summary,
                status: event?.status,
              });
            } catch (e: any) {
              console.error('[corsair/calendar hook] SSE broadcast failed:', e?.message);
            }
          },
        },
      },
    }),
  ],
  database: db,
  kek: process.env.CORSAIR_KEK!,
  multiTenancy: true,
});
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
          after: async (ctx, response, passToAfter) => {
            const type = response.data?.type;
            // "messageReceived" | "messageDeleted" | "messageLabelChanged"

            if (type === 'messageDeleted') return;

            const labelIds: string[] = response.data?.message?.labelIds ?? [];
            const msg = response.data?.message;

            // Classify by labelIds
            if (labelIds.includes('DRAFT')) {
              console.log('Draft saved/updated');
            } else if (labelIds.includes('SENT') && !labelIds.includes('INBOX')) {
              console.log('Email sent');
            } else if (labelIds.includes('INBOX')) {
              // Thread reply: messageId !== threadId
              const isReply = msg?.id !== msg?.threadId;
              console.log(isReply ? 'Thread reply received' : 'New email received');
            }
          },
        },
      },
    }),
    googlecalendar({
      webhookHooks: {
        eventChanged: {
          after: async (ctx, response) => {
            console.log('Calendar event changed:', response.data?.event);
          },
        },
      },
    }),
  ],
  database: db,
  kek: process.env.CORSAIR_KEK!,
  multiTenancy: false,
});
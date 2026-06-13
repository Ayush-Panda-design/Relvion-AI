/**
 * Shared Gmail webhook processor.
 * Called by both the HTTP webhook route and the Corsair after-hook.
 * Responsibilities:
 *   1. AI triage (priority classification)
 *   2. Generate text embedding
 *   3. Upsert into pgvector
 *   4. Broadcast realtime SSE event to all connected clients
 */
import { Pool } from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { localTriage } from '@/server/triage';
import { broadcastEvent } from '@/lib/eventBus';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

export interface IncomingMessage {
  id?: string;
  messageId?: string;
  subject?: string;
  body?: string;
  snippet?: string;
  from?: string;
  labelIds?: string[];
  /** Raw data envelope from Corsair hook */
  data?: {
    subject?: string;
    body?: string;
    from?: string;
  };
}

export async function processIncomingMessage(msg: IncomingMessage): Promise<{
  priority: string;
  embedded: boolean;
}> {
  const emailId = msg.id || msg.messageId || '';
  const subject = msg.subject || msg.data?.subject || '(no subject)';
  const body = msg.snippet || msg.body || msg.data?.body || '';
  const sender = msg.from || msg.data?.from || '';

  // ── 1. Triage ─────────────────────────────────────────────────────────────
  let priority = 'FYI';
  if (process.env.GEMINI_API_KEY && emailId) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Classify as URGENT, IMPORTANT, or FYI only.\nSender: ${sender}\nSubject: ${subject}\nBody: ${body.substring(0, 300)}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().toUpperCase();
      if (text.includes('URGENT')) priority = 'URGENT';
      else if (text.includes('IMPORTANT')) priority = 'IMPORTANT';
    } catch (e: any) {
      const isQuota =
        e?.status === 429 ||
        (e?.message || '').includes('429') ||
        (e?.message || '').includes('Quota exceeded');
      if (isQuota) {
        console.warn('[WebhookProcessor] Gemini quota reached — using local triage.');
      } else {
        console.error('[WebhookProcessor] Gemini error — using local triage:', e?.message);
      }
      priority = localTriage(subject, body, sender);
    }
  } else if (emailId) {
    priority = localTriage(subject, body, sender);
  }

  // ── 2. Embed + pgvector upsert ────────────────────────────────────────────
  let embedded = false;
  if (process.env.GEMINI_API_KEY && emailId) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const embModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const textToEmbed = `${subject} ${body}`.substring(0, 2000);
      const result = await embModel.embedContent(textToEmbed);
      const embedding = result.embedding.values;

      await db.query(
        `INSERT INTO email_embeddings (id, email_id, subject, body_preview, sender, embedding)
         VALUES ($1, $2, $3, $4, $5, $6::vector)
         ON CONFLICT (id) DO UPDATE
           SET embedding = EXCLUDED.embedding,
               subject   = EXCLUDED.subject,
               body_preview = EXCLUDED.body_preview`,
        [
          `emb_${emailId}`,
          emailId,
          subject,
          body.substring(0, 500),
          sender,
          JSON.stringify(embedding),
        ]
      );
      embedded = true;
    } catch (e: any) {
      console.error('[WebhookProcessor] Embedding failed (non-fatal):', e?.message);
    }
  }

  // ── 3. Broadcast SSE event ────────────────────────────────────────────────
  try {
    broadcastEvent('EMAIL_RECEIVED', {
      emailId,
      subject,
      sender,
      priority,
    });
  } catch (e) {
    // Non-fatal — SSE broadcast failures must never block the webhook
  }

  return { priority, embedded };
}

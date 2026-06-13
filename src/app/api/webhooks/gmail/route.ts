import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { localTriage } from '@/server/triage';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

// Real webhook handler: triage + embed new emails
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log('[webhook/gmail] received:', JSON.stringify(payload).slice(0, 200));

    const msg = payload?.data?.message;
    if (!msg) return NextResponse.json({ success: true });

    const emailId = msg.id || msg.messageId;
    const subject = msg.subject || msg.data?.subject || '(no subject)';
    const body = msg.snippet || msg.data?.body || '';
    const sender = msg.from || msg.data?.from || '';

    // 1. AI priority triage
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
        const errorMsg = e?.message || '';
        const isQuotaError = e?.status === 429 || errorMsg.includes('Quota exceeded') || errorMsg.includes('429');
        if (isQuotaError) {
          console.warn(`[Webhook Triage] Gemini API rate limit/quota reached (429). Falling back to local heuristic rules.`);
        } else {
          console.error('[Webhook Triage] Gemini API error, falling back to local rules:', errorMsg || e);
        }
        priority = localTriage(subject, body, sender);
      }
    } else if (emailId) {
      priority = localTriage(subject, body, sender);
    }

    // 2. Embed for vector search
    if (process.env.GEMINI_API_KEY && emailId) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const text = `${subject} ${body}`.substring(0, 2000);
        const result = await model.embedContent(text);
        const embedding = result.embedding.values;

        await db.query(
          `INSERT INTO email_embeddings (id, email_id, subject, body_preview, sender, embedding)
           VALUES ($1, $2, $3, $4, $5, $6::vector)
           ON CONFLICT (id) DO UPDATE SET embedding = EXCLUDED.embedding`,
          [`emb_${emailId}`, emailId, subject, body.substring(0, 500), sender, JSON.stringify(embedding)]
        );
      } catch (e) {
        // Non-fatal
      }
    }

    return NextResponse.json({ success: true, priority });
  } catch (error: any) {
    console.error('[webhook/gmail] error:', error.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

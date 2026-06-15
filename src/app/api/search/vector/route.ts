import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const corsair = corsairForTenant(session.tenantId);

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // 1. Try pgvector semantic search if GEMINI_API_KEY is configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(query);
        const embedding = result.embedding.values;

        const queryStr = `
          SELECT email_id as id, subject, body_preview, sender, 
                 1 - (embedding <=> $1::vector) AS similarity
          FROM email_embeddings
          ORDER BY embedding <=> $1::vector
          LIMIT 10;
        `;

        const pgRes = await db.query(queryStr, [JSON.stringify(embedding)]);

        if (pgRes.rows.length > 0 && pgRes.rows[0].similarity > 0.6) {
          return NextResponse.json({ results: pgRes.rows, source: 'pgvector' });
        }
      } catch (e: any) {
        console.warn('[search/vector] Embedding/PG failed, falling back to Gmail API:', e.message);
      }
    }

    // 2. Fallback: search directly via Gmail API using the q parameter
    try {
      const listRes = await (corsair as any).gmail.api.messages.list({
        q: query,
        maxResults: 10,
      });

      const messageIds: string[] = (listRes?.messages || []).map((m: any) => m.id);

      if (messageIds.length === 0) {
        return NextResponse.json({ results: [], source: 'gmail-api' });
      }

      // Fetch details in parallel (batches of 5)
      const results = [];
      for (let i = 0; i < messageIds.length; i += 5) {
        const batch = messageIds.slice(i, i + 5);
        const msgs = await Promise.all(
          batch.map((id: string) =>
            (corsair as any).gmail.api.messages.get({ id, format: 'full' })
          )
        );
        for (const msg of msgs) {
          if (!msg) continue;
          const headers: any[] = msg.payload?.headers || [];
          const getHeader = (name: string) =>
            headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

          results.push({
            id: msg.id,
            subject: getHeader('Subject') || '(no subject)',
            body_preview: (msg.snippet || '').substring(0, 120),
            sender: getHeader('From') || 'Unknown',
            similarity: 1.0,
          });
        }
      }

      return NextResponse.json({ results, source: 'gmail-api' });
    } catch (e: any) {
      console.error('[search/gmail-api] Gmail API search failed:', e.message);
      return NextResponse.json({ results: [], error: 'Search failed' }, { status: 200 });
    }

  } catch (error: any) {
    console.error('Vector search error:', error.message);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 200 });
  }
}

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';
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


    if (!process.env.GEMINI_API_KEY) {
      // Fallback directly to Gmail DB if AI is unconfigured
      const dbRes = await (corsair as any).gmail.db.messages.search({ query });
      const mapped = (dbRes || []).map((m: any) => ({
        id: m.id,
        subject: m.subject || '(no subject)',
        body_preview: (m.snippet || '').substring(0, 100),
        sender: m.from || 'Unknown',
        similarity: 1.0,
      }));
      return NextResponse.json({ results: mapped, source: 'gmail-db' });
    }

    try {
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
      
      // If we got good local results (similarity > 0.6), return them
      if (pgRes.rows.length > 0 && pgRes.rows[0].similarity > 0.6) {
        return NextResponse.json({ results: pgRes.rows, source: 'pgvector' });
      }
    } catch (e: any) {
      console.warn('[search/vector] Embedding/PG failed, falling back to Gmail DB:', e.message);
    }

    // Fallback: If pgvector returned nothing useful or failed, query Corsair's Gmail DB sync
    try {
      const dbRes = await (corsair as any).gmail.db.messages.search({ query });
      const mapped = (dbRes || []).map((m: any) => ({
        id: m.id,
        subject: m.subject || '(no subject)',
        body_preview: (m.snippet || '').substring(0, 100),
        sender: m.from || 'Unknown',
        similarity: 1.0, // Exact match
      }));
      return NextResponse.json({ results: mapped, source: 'gmail-db' });
    } catch (e: any) {
      console.error('[search/fallback] Gmail DB search also failed:', e.message);
      return NextResponse.json({ results: [], error: 'Search failed completely' }, { status: 200 });
    }

  } catch (error: any) {
    console.error('Vector search error:', error.message);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 200 });
  }
}

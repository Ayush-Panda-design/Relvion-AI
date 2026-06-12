import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const db = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ results: [] });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Mock fallback
      return NextResponse.json({ 
        results: [{ id: 'msg-1', subject: 'Mock Search Result for: ' + query }],
        source: 'mock' 
      });
    }

    // Generate embedding for query
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(query);
    const embedding = result.embedding.values;

    // Search pgvector
    const queryStr = `
      SELECT email_id, subject, body_preview, sender, 
             1 - (embedding <=> $1::vector) AS similarity
      FROM email_embeddings
      ORDER BY embedding <=> $1::vector
      LIMIT 10;
    `;
    
    const dbRes = await db.query(queryStr, [JSON.stringify(embedding)]);

    return NextResponse.json({ results: dbRes.rows, source: 'pgvector' });
  } catch (error) {
    console.error('Vector search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

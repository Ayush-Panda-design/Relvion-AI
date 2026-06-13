import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const db = new Pool({ connectionString: process.env.DATABASE_URL });

// Called after fetching emails — embeds them into pgvector for fast search
export async function POST(req: Request) {
  try {
    const { emails } = await req.json();
    if (!emails?.length || !process.env.GEMINI_API_KEY) {
      return NextResponse.json({ embedded: 0 });
    }

    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    let embedded = 0;

    for (const email of emails) {
      try {
        const text = `${email.data?.subject || ''} ${email.data?.body || ''}`.substring(0, 2000);
        const result = await model.embedContent(text);
        const embedding = result.embedding.values;

        await db.query(
          `INSERT INTO email_embeddings (id, email_id, subject, body_preview, sender, embedding)
           VALUES ($1, $2, $3, $4, $5, $6::vector)
           ON CONFLICT (id) DO UPDATE SET embedding = EXCLUDED.embedding, subject = EXCLUDED.subject`,
          [
            `emb_${email.id}`,
            email.id,
            email.data?.subject || '',
            (email.data?.body || '').substring(0, 500),
            email.data?.from || '',
            JSON.stringify(embedding),
          ]
        );
        embedded++;
      } catch (e) {
        // Non-fatal — skip this email
      }
    }

    return NextResponse.json({ embedded });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

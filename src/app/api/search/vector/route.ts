import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { parseGmailSearchQuery } from '@/lib/gmail-search-parser';
import {
  searchCalendarViaCorsairDb,
  searchGmailViaApi,
  searchGmailViaCorsairDb,
  type UnifiedSearchResult,
} from '@/lib/corsair-search';

export type SearchSource =
  | 'corsair-db'
  | 'corsair-db+calendar'
  | 'gmail-api'
  | 'pgvector'
  | 'pgvector+corsair';

async function vectorSearch(query: string): Promise<UnifiedSearchResult[]> {
  if (!process.env.GEMINI_API_KEY) return [];

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(query);
  const embedding = result.embedding.values;

  const pgRes = await db.query(
    `SELECT email_id as id, subject, body_preview, sender,
            1 - (embedding <=> $1::vector) AS similarity
     FROM email_embeddings
     ORDER BY embedding <=> $1::vector
     LIMIT 10`,
    [JSON.stringify(embedding)]
  );

  if (pgRes.rows.length === 0 || pgRes.rows[0].similarity <= 0.6) return [];

  return pgRes.rows.map((row: Record<string, unknown>) => ({
    id: String(row.id),
    type: 'email' as const,
    subject: String(row.subject || '(no subject)'),
    body_preview: String(row.body_preview || ''),
    sender: String(row.sender || 'Unknown'),
    similarity: Number(row.similarity) || 0,
  }));
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const corsair = corsairForTenant(session.tenantId);
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();
    const includeCalendar = searchParams.get('calendar') !== '0';

    if (!query) {
      return NextResponse.json({ results: [], events: [], source: 'corsair-db', operators: [] });
    }

    const parsed = parseGmailSearchQuery(query);
    let source: SearchSource = 'corsair-db';
    let results: UnifiedSearchResult[] = [];
    let events: UnifiedSearchResult[] = [];

    // 1. Gmail operators that need live API (is:unread, has:attachment, etc.)
    if (parsed.requiresGmailApi) {
      results = await searchGmailViaApi(corsair, parsed.gmailQ, 10);
      source = 'gmail-api';
    } else {
      // 2. Corsair DB search — fast local search on cached corsair_entities
      results = await searchGmailViaCorsairDb(corsair, parsed, 10);

      // 3. Semantic vector search for natural-language queries (no Gmail operators)
      const isNaturalLanguage =
        parsed.operators.length === 0 && Boolean(parsed.filters.freeText);
      if (isNaturalLanguage && results.length < 3) {
        try {
          const vectorResults = await vectorSearch(query);
          if (vectorResults.length > 0) {
            const seen = new Set(results.map((r) => r.id));
            for (const vr of vectorResults) {
              if (!seen.has(vr.id)) {
                results.push(vr);
                seen.add(vr.id);
              }
            }
            source = results.length > vectorResults.length ? 'pgvector+corsair' : 'pgvector';
          }
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          console.warn('[search] vector fallback skipped:', msg);
        }
      }

      // 4. Corsair DB empty → Gmail API fallback
      if (results.length === 0) {
        try {
          results = await searchGmailViaApi(corsair, parsed.gmailQ, 10);
          source = 'gmail-api';
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          console.warn('[search] Gmail API fallback failed:', msg);
        }
      }
    }

    // 5. Calendar events via Corsair DB search
    if (includeCalendar) {
      try {
        events = await searchCalendarViaCorsairDb(corsair, query, 5);
        if (events.length > 0 && source === 'corsair-db') {
          source = 'corsair-db+calendar';
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn('[search] calendar db search failed:', msg);
      }
    }

    return NextResponse.json({
      results,
      events,
      source,
      operators: parsed.operators,
      parsed: parsed.filters,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[search] error:', msg);
    return NextResponse.json({ results: [], events: [], error: 'Search failed' }, { status: 200 });
  }
}

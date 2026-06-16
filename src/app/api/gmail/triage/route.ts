import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSession } from '@/lib/auth/getSession';
import { parseEmailAddress } from '@/lib/gmail/parseMessage';
import { localTriage } from '@/server/triage';
import { applyContactBoost, getContactStats } from '@/server/services/contacts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function finalizePriority(
  priority: 'URGENT' | 'IMPORTANT' | 'FYI',
  tenantId: string | null,
  sender: string
): Promise<'URGENT' | 'IMPORTANT' | 'FYI'> {
  if (!tenantId) return priority;
  const email = parseEmailAddress(sender) || sender;
  const stats = await getContactStats(tenantId, email);
  if (!stats) return priority;
  return applyContactBoost(priority, stats.email_count);
}

export async function POST(req: Request) {
  let subject = '';
  let body = '';
  let sender = '';

  try {
    const json = await req.json();
    subject = json.subject || '';
    body = json.body || '';
    sender = json.sender || '';
  } catch {
    return NextResponse.json({ priority: 'FYI', error: 'Invalid request body' }, { status: 400 });
  }

  const session = await getSession();
  const tenantId = session?.tenantId || null;

  if (!process.env.GEMINI_API_KEY) {
    let priority = localTriage(subject, body, sender);
    priority = await finalizePriority(priority, tenantId, sender);
    return NextResponse.json({ priority, fallback: true });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Classify this email as URGENT, IMPORTANT, or FYI.
URGENT: needs reply within hours, deadlines, emergencies
IMPORTANT: needs reply within 1-2 days, work related
FYI: newsletters, notifications, no reply needed

Return ONLY one word: URGENT, IMPORTANT, or FYI

Sender: ${sender}
Subject: ${subject}
Body: ${body.substring(0, 500)}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().toUpperCase();

    let priority: 'URGENT' | 'IMPORTANT' | 'FYI' = 'FYI';
    if (responseText.includes('URGENT')) priority = 'URGENT';
    else if (responseText.includes('IMPORTANT')) priority = 'IMPORTANT';

    priority = await finalizePriority(priority, tenantId, sender);
    return NextResponse.json({ priority, fallback: false });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : '';
    const isQuotaError =
      (error as { status?: number })?.status === 429 ||
      errorMsg.includes('Quota exceeded') ||
      errorMsg.includes('429');

    if (isQuotaError) {
      console.warn('[Triage] Gemini quota reached — falling back to local rules.');
    } else {
      console.error('[Triage] Gemini error, falling back to local rules:', errorMsg || error);
    }

    let priority = localTriage(subject, body, sender);
    priority = await finalizePriority(priority, tenantId, sender);
    return NextResponse.json({ priority, fallback: true });
  }
}


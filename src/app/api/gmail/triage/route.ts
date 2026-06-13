import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { localTriage } from '@/server/triage';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  let subject = '';
  let body = '';
  let sender = '';

  try {
    const json = await req.json();
    subject = json.subject || '';
    body = json.body || '';
    sender = json.sender || '';
  } catch (err) {
    return NextResponse.json({ priority: 'FYI', error: 'Invalid request body' }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    const priority = localTriage(subject, body, sender);
    return NextResponse.json({ priority, fallback: true });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
    
    let priority = 'FYI';
    if (responseText.includes('URGENT')) priority = 'URGENT';
    else if (responseText.includes('IMPORTANT')) priority = 'IMPORTANT';

    return NextResponse.json({ priority, fallback: false });
  } catch (error: any) {
    const errorMsg = error?.message || '';
    const isQuotaError = error?.status === 429 || errorMsg.includes('Quota exceeded') || errorMsg.includes('429');
    
    if (isQuotaError) {
      console.warn(`[Triage] Gemini API rate limit/quota reached (429). Falling back to local heuristic rules.`);
    } else {
      console.error('[Triage] Gemini API error, falling back to local rules:', errorMsg || error);
    }

    const priority = localTriage(subject, body, sender);
    return NextResponse.json({ priority, fallback: true });
  }
}


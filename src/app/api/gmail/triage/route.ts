import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { subject, body, sender } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ priority: 'FYI', source: 'mock' });
    }

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

    return NextResponse.json({ priority });
  } catch (error) {
    console.error('Triage error:', error);
    return NextResponse.json({ priority: 'FYI', error: 'Failed to triage' }, { status: 500 });
  }
}

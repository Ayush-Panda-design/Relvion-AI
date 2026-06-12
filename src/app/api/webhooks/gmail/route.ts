import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log('Received Gmail webhook:', payload);
    
    // In a real implementation:
    // 1. Send the email body to Gemini for priority triage
    // 2. Generate an embedding and store it in pgvector
    // 3. Update the UI via Server-Sent Events

    return NextResponse.json({ success: true, message: 'Webhook processed' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

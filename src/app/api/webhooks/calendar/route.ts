import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log('Received Calendar webhook:', payload);
    
    return NextResponse.json({ success: true, message: 'Calendar webhook processed' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { corsair } from '@/server/corsair';

export async function GET() {
  try {
    const profile = await (corsair as any).gmail.api.users.getProfile({ userId: 'me' });
    return NextResponse.json({
      email: profile?.emailAddress || '',
      messagesTotal: profile?.messagesTotal || 0,
      threadsTotal: profile?.threadsTotal || 0,
    });
  } catch (error: any) {
    console.error('[gmail/profile] failed:', error.message);
    return NextResponse.json({ email: '', messagesTotal: 0, threadsTotal: 0 });
  }
}

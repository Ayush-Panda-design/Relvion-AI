import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth/session';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST() {
  const res = NextResponse.redirect(`${APP_URL}/signin`);
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    sameSite: 'lax',
    path: '/',
  });
  return res;
}

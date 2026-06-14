import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth/session';

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'Email and password (min 6 chars) are required' },
        { status: 400 }
      );
    }

    const lowerEmail = email.toLowerCase().trim();

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [lowerEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const userId = crypto.randomUUID();
    // For email/password users, the tenant_id is initially their user ID.
    // When they connect Google later, it stays the same, and we just provision Corsair tokens under it.
    const tenantId = userId; 

    await db.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, created_at, last_login)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [userId, tenantId, lowerEmail, passwordHash]
    );

    // Set session cookie
    const token = await createSessionToken({ userId, tenantId, email: lowerEmail });
    const res = NextResponse.json({ success: true, redirect: '/' });
    
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      path: '/',
    });

    return res;
  } catch (error: any) {
    console.error('[auth/register] error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}

/**
 * Provision Corsair integration rows in the target database.
 * Usage: pnpm corsair-setup  (requires DATABASE_URL + CORSAIR_KEK in .env)
 *
 * For production, point DATABASE_URL at Render and use the same CORSAIR_KEK as Vercel.
 * Set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET to store OAuth app credentials.
 */

import 'dotenv/config';
import { ensureCorsairSetup } from '../src/server/ensureCorsairSetup';
import { getDbPool } from '../src/lib/db';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  if (!process.env.CORSAIR_KEK) {
    console.error('CORSAIR_KEK is not set');
    process.exit(1);
  }

  const hasGoogleCreds = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  console.log('Running Corsair setup…');
  if (!hasGoogleCreds) {
    console.warn(
      'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — integration rows will be created but OAuth will fail until credentials are stored.',
    );
    console.warn(
      'Alternatively: npx corsair setup --gmail client_id=... client_secret=...',
    );
  }

  try {
    await ensureCorsairSetup();
    console.log('✅ Corsair setup completed');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ Corsair setup failed:', msg);
    process.exit(1);
  } finally {
    await getDbPool().end();
  }
}

main();

/**
 * scripts/register-webhooks.ts
 *
 * Registers Gmail push notifications and Google Calendar webhook watches
 * with Google via Corsair. Run this once after starting your dev tunnel
 * (ngrok) or after deploying to production.
 *
 * Usage:
 *   npx tsx scripts/register-webhooks.ts
 *
 * Requirements:
 *   WEBHOOK_BASE_URL in .env.local  (e.g. https://abc123.ngrok-free.app)
 *   CORSAIR_KEK, DATABASE_URL, GEMINI_API_KEY also set in .env.local
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { createCorsair } from 'corsair';
import { gmail } from '@corsair-dev/gmail';
import { googlecalendar } from '@corsair-dev/googlecalendar';

// ── Validate env ──────────────────────────────────────────────────────────────

const BASE_URL = (process.env.WEBHOOK_BASE_URL || '').replace(/\/$/, '');
const CORSAIR_KEK = process.env.CORSAIR_KEK;
const DATABASE_URL = process.env.DATABASE_URL;

if (!BASE_URL) {
  console.error('\n❌  WEBHOOK_BASE_URL is not set in .env.local');
  console.error('    Set it to your ngrok URL (e.g. https://abc123.ngrok-free.app)');
  console.error('    or your production domain (e.g. https://relvion.vercel.app)\n');
  process.exit(1);
}

if (!CORSAIR_KEK || !DATABASE_URL) {
  console.error('\n❌  CORSAIR_KEK and DATABASE_URL must be set in .env.local\n');
  process.exit(1);
}

if (BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1')) {
  console.error('\n❌  WEBHOOK_BASE_URL cannot be localhost — Google cannot reach it.');
  console.error('    Use ngrok: npx ngrok http 3000\n');
  process.exit(1);
}

// ── Build Corsair instance ────────────────────────────────────────────────────

const db = new Pool({ connectionString: DATABASE_URL });

const corsairInstance = createCorsair({
  plugins: [gmail(), googlecalendar()],
  database: db,
  kek: CORSAIR_KEK,
  multiTenancy: false,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function printSection(title: string) {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(50));
}

function printResult(label: string, value: string) {
  console.log(`  ${label.padEnd(18)} ${value}`);
}

// ── Gmail: register Pub/Sub push notification ─────────────────────────────────
//
// Corsair's Gmail plugin exposes corsair.gmail.api.users.watch() which
// tells Google to push new-message notifications to your webhook URL.
// The URL must be publicly reachable (ngrok or deployed URL).

async function registerGmailWebhook() {
  printSection('Gmail Webhook');

  const webhookUrl = `${BASE_URL}/api/webhooks/gmail`;
  printResult('Webhook URL:', webhookUrl);

  try {
    // Gmail watch requires a Google Cloud Pub/Sub topic that is owned by
    // the same Google Cloud project as the OAuth credentials. Corsair
    // handles the Pub/Sub subscription internally when you call watch().
    const result = await (corsairInstance as any).gmail.api.users.watch({
      userId: 'me',
      requestBody: {
        // labelIds restricts which labels trigger notifications.
        // 'INBOX' means only new inbox messages, not sent/drafts.
        labelIds: ['INBOX'],
        labelFilterAction: 'include',
        topicName: process.env.GMAIL_PUBSUB_TOPIC || undefined,
      },
    });

    const expiresAt = result?.expiration
      ? new Date(Number(result.expiration)).toLocaleString()
      : 'unknown';

    printResult('Status:', '✅  Registered');
    printResult('History ID:', result?.historyId ?? 'N/A');
    printResult('Expires:', expiresAt);

    console.log('\n  ℹ️  Gmail watches expire after 7 days. Re-run this script');
    console.log('      before expiry, or set up a cron job to call:');
    console.log(`      POST ${BASE_URL}/api/webhooks/register`);
  } catch (err: any) {
    const msg: string = err?.message ?? String(err);

    if (msg.includes('topicName') || msg.includes('Pub/Sub')) {
      console.error('\n  ❌  Gmail webhook failed — Pub/Sub topic not configured.');
      console.error('      You need to:');
      console.error('      1. Create a Google Cloud Pub/Sub topic');
      console.error('      2. Add GMAIL_PUBSUB_TOPIC=projects/YOUR_PROJECT/topics/YOUR_TOPIC to .env.local');
      console.error('      3. Grant gmail-api-push@system.gserviceaccount.com "Pub/Sub Publisher" role on the topic');
      console.error('\n      See: https://developers.google.com/gmail/api/guides/push');
    } else if (msg.includes('403') || msg.includes('insufficient')) {
      console.error('\n  ❌  Gmail webhook failed — insufficient OAuth scope.');
      console.error('      Re-authenticate with: npx corsair auth --plugin=gmail');
    } else {
      console.error('\n  ❌  Gmail webhook failed:', msg);
    }
  }
}

// ── Calendar: register a push channel ────────────────────────────────────────
//
// Google Calendar uses a "push channel" (channel.watch) model. Unlike Gmail,
// Calendar does not require Pub/Sub — the URL receives HTTP POST directly.
// Each watch expires after at most 7 days; the expiry is returned in the response.

async function registerCalendarWebhook() {
  printSection('Google Calendar Webhook');

  const webhookUrl = `${BASE_URL}/api/webhooks/calendar`;
  const channelId = `relvion-cal-${Date.now()}`;

  printResult('Webhook URL:', webhookUrl);
  printResult('Channel ID:', channelId);

  try {
    const result = await (corsairInstance as any).googlecalendar.api.channels.watch({
      calendarId: 'primary',
      requestBody: {
        id: channelId,
        type: 'web_hook',
        address: webhookUrl,
        // token is echoed back in the X-Goog-Channel-Token header of each
        // notification so you can verify the request is from Google.
        token: process.env.CALENDAR_WEBHOOK_TOKEN || 'relvion-calendar-token',
        params: {
          // Optional: request a full resource body in the notification payload
          ttl: '604800', // 7 days in seconds
        },
      },
    });

    const expiresAt = result?.expiration
      ? new Date(Number(result.expiration)).toLocaleString()
      : 'unknown';

    printResult('Status:', '✅  Registered');
    printResult('Resource ID:', result?.resourceId ?? 'N/A');
    printResult('Expires:', expiresAt);

    // Persist the channel ID + resourceId so we can stop it later
    console.log('\n  ℹ️  Save these values to stop this watch channel later:');
    console.log(`      Channel ID:   ${channelId}`);
    console.log(`      Resource ID:  ${result?.resourceId}`);
  } catch (err: any) {
    const msg: string = err?.message ?? String(err);

    if (msg.includes('403') || msg.includes('insufficient')) {
      console.error('\n  ❌  Calendar webhook failed — insufficient OAuth scope.');
      console.error('      Re-authenticate with: npx corsair auth --plugin=googlecalendar');
    } else if (msg.includes('400')) {
      console.error('\n  ❌  Calendar webhook failed — bad request.');
      console.error('      Make sure WEBHOOK_BASE_URL is a valid HTTPS URL.');
    } else {
      console.error('\n  ❌  Calendar webhook failed:', msg);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔗  Relvion AI — Webhook Registration');
  console.log(`    Base URL: ${BASE_URL}`);

  await registerGmailWebhook();
  await registerCalendarWebhook();

  printSection('Done');
  console.log('  Both webhooks are now registered with Google.');
  console.log('  Your app will receive real-time push notifications at:');
  console.log(`    Gmail:    ${BASE_URL}/api/webhooks/gmail`);
  console.log(`    Calendar: ${BASE_URL}/api/webhooks/calendar`);
  console.log('');

  await db.end();
}

main().catch(err => {
  console.error('\n💥  Unexpected error:', err);
  db.end();
  process.exit(1);
});
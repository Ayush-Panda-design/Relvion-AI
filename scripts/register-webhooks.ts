import 'dotenv/config';

const baseUrl = process.env.WEBHOOK_BASE_URL || process.env.APP_URL || '';

async function main() {
  if (!baseUrl || baseUrl.includes('localhost')) {
    console.error(
      'Set WEBHOOK_BASE_URL to your public URL (e.g. ngrok). Google cannot reach localhost.'
    );
    process.exit(1);
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/webhooks/register`, {
    method: 'POST',
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));

  if (!res.ok) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

// app/api/webhooks/route.ts
import { processWebhook } from 'corsair';
import { corsair } from '@/server/corsair';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const result = await processWebhook(
    corsair,
    Object.fromEntries(req.headers),
    await req.json(),
    { tenantId: url.searchParams.get('tenantId') ?? undefined }
  );

  if (result.plugin) {
    console.log(`Handled: ${result.plugin}.${result.action}`);
  }

  return Response.json(result.response);
}
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, type FunctionDeclaration } from '@google/generative-ai';
import { AnthropicProvider } from '@corsair-dev/mcp';
import { corsair } from '@/server/corsair';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CorsairTool {
  name: string;
  description?: string;
  input_schema: Record<string, unknown>;
  run: (args: unknown) => Promise<string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL = 'gemini-2.5-flash';
const MAX_TOOL_LOOPS = 10;
const MAX_RESULT_CHARS = 8_000;

// ─── API Key Pool ─────────────────────────────────────────────────────────────
// Read GEMINI_API_KEYS (comma-separated) or fall back to GEMINI_API_KEY
function getApiKeys(): string[] {
  const multi = process.env.GEMINI_API_KEYS;
  if (multi) {
    const keys = multi.split(',').map(k => k.trim()).filter(Boolean);
    if (keys.length > 0) return keys;
  }
  const single = process.env.GEMINI_API_KEY;
  if (single) return [single.trim()];
  return [];
}

let keyIndex = 0;
function nextApiKey(keys: string[]): string {
  const key = keys[keyIndex % keys.length];
  keyIndex = (keyIndex + 1) % keys.length;
  return key;
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Relvion AI Assistant inside a Superhuman-style email client.
You have access to the user's live Gmail and Google Calendar via Corsair tools.

TOOLS AVAILABLE:
- list_operations: List all available Corsair API operations.
- get_schema: Get the schema for a specific Corsair operation path.
- run_script: Execute JavaScript with \`corsair\` in scope.

CRITICAL: ALWAYS use run_script to read emails and calendar events.
Example for fetching recent emails:
call: run_script({
  code: "const msgs = await corsair.gmail.api.messages.list({ maxResults: 5 }); const details = await Promise.all(msgs.messages.map(m => corsair.gmail.api.messages.get({ id: m.id }))); return details;"
})

Example for fetching calendar events:
call: run_script({
  code: "return await corsair.googlecalendar.api.events.getMany({ maxResults: 5, timeMin: new Date().toISOString(), singleEvents: true, orderBy: 'startTime' });"
})

Example for CREATING a calendar event (note: top-level key is "event", NOT "resource"):
call: run_script({
  code: "return await corsair.googlecalendar.api.events.create({ calendarId: 'primary', event: { summary: 'Edinform', start: { dateTime: '2026-06-24T19:00:00+05:30', timeZone: 'Asia/Kolkata' }, end: { dateTime: '2026-06-24T20:00:00+05:30', timeZone: 'Asia/Kolkata' }, attendees: [{ email: 'aryan@gmail.com' }, { email: 'pooja@gmail.com' }] }, sendUpdates: 'all' });"
})

Example for SENDING an email:
call: run_script({
  code: "const raw = Buffer.from('To: friend@example.com\\r\\nSubject: Hello\\r\\n\\r\\nBody text here').toString('base64url'); return await corsair.gmail.api.messages.send({ raw });"
})

STRATEGY:
1. Always use run_script to fetch real live data. Do not say "I cannot read emails" — use run_script!
2. Parse all results and give the user a clear, concise answer.
3. If a tool call fails, report the error to the user rather than failing silently.
4. After creating/updating/sending something (event, email), check the run_script result for an "error" or "isError" field. Only tell the user it succeeded if the result contains a real object/ID with no error. If there's an error, explain it and try to fix the request — never claim success on a failed call.`;

// ─── Module-level singletons (built once, reused across requests) ─────────────

let toolsReady: Promise<{
  geminiDeclarations: FunctionDeclaration[];
  handlerMap: Map<string, (args: unknown) => Promise<string>>;
}> | null = null;

function getTools() {
  if (!toolsReady) {
    toolsReady = (async () => {
      // AnthropicProvider.build() is synchronous per Corsair docs
      const provider = new AnthropicProvider();
      const corsairTools: CorsairTool[] = provider.build({ corsair }) as unknown as CorsairTool[];

      console.log('[Agent] Validating Corsair tools:');
      for (const t of corsairTools) {
        console.log(`  [✓] ${t.name}`);
      }

      // Corsair tool declarations (cleaned for Gemini)
      const geminiDeclarations: FunctionDeclaration[] = corsairTools.map(t => ({
        name: t.name,
        description: t.description ?? '',
        parameters: cleanSchema(t.input_schema) as any,
      }));

      // Handler map: Corsair handlers
      const handlerMap = new Map<string, (args: unknown) => Promise<string>>();

      for (const t of corsairTools) {
        handlerMap.set(t.name, t.run);
      }

      return { geminiDeclarations, handlerMap };
    })();
  }
  return toolsReady;
}

// ─── Schema cleaner ───────────────────────────────────────────────────────────
// Gemini rejects JSON Schema fields it doesn't understand ($schema, etc.)

function cleanSchema(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(cleanSchema);
  if (obj !== null && typeof obj === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { $schema, ...rest } = obj as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(rest).map(([k, v]) => [k, cleanSchema(v)])
    );
  }
  return obj;
}

// ─── Tool result extractor ────────────────────────────────────────────────────

function extractToolText(result: unknown): string {
  if (typeof result === 'string') return result;
  return JSON.stringify(result) ?? 'null';
}

// ─── Gemini call with retry — handles 429 (rate limit) and 503 (overload) ────

function parseRetryAfterMs(errMsg: string): number | null {
  // Gemini 429 responses include e.g. "retry in 33.13251998s" or "retryDelay":"33s"
  const secMatch = errMsg.match(/retry(?:Delay)?["\s:]+(\d+(?:\.\d+)?)s/i);
  if (secMatch) return Math.ceil(parseFloat(secMatch[1])) * 1_000;
  const plainMatch = errMsg.match(/retry in (\d+)/i);
  if (plainMatch) return parseInt(plainMatch[1], 10) * 1_000;
  return null;
}

async function sendWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 6,
  label = 'Gemini call'
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastErr = err;
      const msg = (err as Error)?.message ?? '';

      const is429 = msg.includes('429') || msg.includes('quota') || msg.includes('rate');
      const is503 = msg.includes('503') || msg.includes('overloaded') || msg.includes('UNAVAILABLE');

      if (!is429 && !is503) throw err; // non-retryable
      if (i === maxRetries - 1) throw err; // out of retries

      let waitMs: number;
      if (is429) {
        const suggested = parseRetryAfterMs(msg);
        waitMs = suggested ? suggested + 2_000 : (i + 1) * 15_000;
        console.warn(`[Agent] ${label} — 429 rate limited (attempt ${i + 1}/${maxRetries}), waiting ${waitMs / 1000}s…`);
      } else {
        waitMs = (i + 1) * 8_000;
        console.warn(`[Agent] ${label} — 503 overloaded (attempt ${i + 1}/${maxRetries}), retrying in ${waitMs / 1000}s…`);
      }

      await new Promise(r => setTimeout(r, waitMs));
    }
  }
  throw lastErr;
}

// ─── Classify error for user-facing messages ─────────────────────────────────

function classifyError(err: unknown): NextResponse {
  const msg = (err as Error)?.message ?? String(err);

  if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
    const match = msg.match(/retry in (\d+)/i);
    const hint = match ? ` Please retry in ~${match[1]} seconds.` : '';
    return NextResponse.json(
      { reply: `The AI service is currently rate-limited (free tier quota reached).${hint}` },
      { status: 200 }
    );
  }
  if (msg.includes('503') || msg.includes('overloaded') || msg.includes('UNAVAILABLE')) {
    return NextResponse.json(
      { reply: 'Gemini is experiencing high demand right now. Please wait a few seconds and try again.' },
      { status: 200 }
    );
  }
  if (msg.includes('API_KEY') || msg.includes('401') || msg.includes('403')) {
    return NextResponse.json(
      { reply: 'Invalid or missing GEMINI_API_KEY. Please check your .env.local file.' },
      { status: 200 }
    );
  }

  console.error('[Agent] Unhandled error:', msg);
  return NextResponse.json(
    { reply: 'Sorry, I encountered an unexpected error. Check the server console for details.' },
    { status: 500 }
  );
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // ── 1. Validate env ──────────────────────────────────────────────────────────
  const apiKeys = getApiKeys();
  if (apiKeys.length === 0) {
    return NextResponse.json({
      reply: 'Please add GEMINI_API_KEY (or GEMINI_API_KEYS) to your .env file to enable the AI Assistant.',
    });
  }

  // ── 2. Parse request ─────────────────────────────────────────────────────────
  let message: string;
  let history: { role: string; parts: { text: string }[] }[] = [];
  try {
    const body = await req.json();
    message = body.message;
    if (Array.isArray(body.history)) {
      const h = body.history as { role: string; parts: { text: string }[] }[];
      const firstUser = h.findIndex(m => m.role === 'user');
      history = firstUser >= 0 ? h.slice(firstUser) : [];
    }
    if (!message?.trim()) {
      return NextResponse.json({ reply: 'Please send a non-empty message.' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ reply: 'Invalid request body.' }, { status: 400 });
  }

  // ── 3. Load tools (cached singleton) ─────────────────────────────────────────
  let geminiDeclarations: FunctionDeclaration[];
  let handlerMap: Map<string, (args: unknown) => Promise<string>>;

  try {
    ({ geminiDeclarations, handlerMap } = await getTools());
  } catch (err) {
    console.error('[Agent] Failed to load Corsair tools:', err);
    return NextResponse.json(
      { reply: 'Failed to initialise Corsair tools. Check your Corsair configuration.' },
      { status: 500 }
    );
  }

  // ── 4. Initialise Gemini with key rotation ───────────────────────────────────
  try {
    let currentKeyIdx = keyIndex;

    const makeModel = (apiKey: string) => {
      const genAI = new GoogleGenerativeAI(apiKey);
      return genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: geminiDeclarations }],
        generationConfig: { temperature: 0.2 },
      });
    };

    let model = makeModel(nextApiKey(apiKeys));
    let chat = model.startChat({ history });
    console.log(`[Agent] Using key pool of ${apiKeys.length} key(s)`);

    // On 429: immediately rotate to next key. On 503: short wait.
    async function sendWithRotation(fn: () => Promise<any>, label: string): Promise<any> {
      let lastErr: unknown;
      const maxAttempts = Math.max(apiKeys.length * 2, 4);
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          return await fn();
        } catch (err: unknown) {
          lastErr = err;
          const msg = (err as Error)?.message ?? '';
          const is429 = msg.includes('429') || msg.includes('quota') || msg.includes('rate');
          const is503 = msg.includes('503') || msg.includes('overloaded') || msg.includes('UNAVAILABLE');

          if (!is429 && !is503) throw err;

          if (is429 && apiKeys.length > 1) {
            const newKey = nextApiKey(apiKeys);
            console.warn(`[Agent] ${label} — 429, rotating to key #${keyIndex} of ${apiKeys.length}`);
            currentKeyIdx = keyIndex;
            model = makeModel(newKey);
            chat = model.startChat({ history });
          } else {
            const waitMs = is503 ? (attempt + 1) * 5_000 : (attempt + 1) * 10_000;
            console.warn(`[Agent] ${label} — ${is429 ? '429' : '503'} attempt ${attempt + 1}, waiting ${waitMs / 1000}s…`);
            await new Promise(r => setTimeout(r, waitMs));
          }
        }
      }
      throw lastErr;
    }

    // ── 5. First turn ────────────────────────────────────────────────────────
    let result = await sendWithRotation(
      () => chat.sendMessage(message),
      'initial message'
    );

    let call = result.response.functionCalls()?.[0];
    console.log('[Agent] Initial response —', call ? `tool: ${call.name}` : 'text reply');

    // ── 6. Tool-calling loop ─────────────────────────────────────────────────
    let loops = 0;
    while (call && loops < MAX_TOOL_LOOPS) {
      loops++;

      const handler = handlerMap.get(call.name);
      if (!handler) {
        console.warn(`[Agent] Unknown tool: ${call.name}`);
        result = await sendWithRotation(
          () => chat.sendMessage([{
            functionResponse: {
              name: call!.name,
              response: { error: `Tool "${call!.name}" is not available.` },
            },
          }]),
          `tool-response (unknown: ${call.name})`
        );
        call = result.response.functionCalls()?.[0];
        continue;
      }

      console.log(`[Agent] [${loops}/${MAX_TOOL_LOOPS}] Calling: ${call.name}`);

      let responseObj: Record<string, string>;
      try {
        const toolResult = await Promise.resolve(handler(call.args));
        const raw = extractToolText(toolResult);
        const truncated = raw.length > MAX_RESULT_CHARS
          ? raw.slice(0, MAX_RESULT_CHARS) + '\n\n[... result truncated ...]'
          : raw;
        console.log(`[Agent] ${call.name} result: ${raw.length} chars`);
        responseObj = { result: truncated };

        // If a run_script call succeeded and looks like it mutated calendar/gmail,
        // broadcast an SSE event so the UI refreshes immediately (don't rely on
        // Google push webhooks / ngrok being configured).
        if (call.name === 'run_script' && !raw.includes('"isError"') && !raw.includes('"error"')) {
          const code = String((call.args as any)?.code ?? '');
          try {
            const { broadcastEvent } = await import('@/lib/eventBus');
            if (/googlecalendar\.api\.events\.(create|update|delete)/.test(code)) {
              broadcastEvent('CALENDAR_UPDATED', {});
            }
            if (/gmail\.api\.messages\.(send|modify|delete|trash)/.test(code)) {
              broadcastEvent('EMAIL_UPDATED', {});
            }
          } catch {}
        }
      } catch (toolErr: unknown) {
        const errMsg = (toolErr as Error)?.message ?? 'Tool execution failed';
        console.error(`[Agent] Tool error (${call.name}):`, errMsg);
        responseObj = { error: errMsg };
      }

      try {
        result = await sendWithRotation(
          () => chat.sendMessage([{
            functionResponse: {
              name: call!.name,
              response: responseObj,
            },
          }]),
          `tool-response (${call.name})`
        );
        call = result.response.functionCalls()?.[0];
        console.log('[Agent] Next step:', call ? `tool: ${call.name}` : 'final text reply');
      } catch (geminiErr: unknown) {
        const errMsg = (geminiErr as Error)?.message ?? '';
        console.error('[Agent] Gemini rejected function response:', errMsg);
        result = await sendWithRotation(
          () => chat.sendMessage(
            `Tool "${call!.name}" returned: ${JSON.stringify(responseObj).slice(0, 2_000)}`
          ),
          'fallback plain text'
        );
        call = null;
      }
    }

    if (loops >= MAX_TOOL_LOOPS) {
      console.warn(`[Agent] Hit tool loop limit (${MAX_TOOL_LOOPS}).`);
    }

    // ── 7. Extract final text ────────────────────────────────────────────────
    const text = result.response.text()?.trim();
    if (!text) {
      return NextResponse.json({
        reply: "I processed your request but didn't generate a response. Please try rephrasing.",
      });
    }

    return NextResponse.json({ reply: text });

  } catch (err) {
    return classifyError(err);
  }
}
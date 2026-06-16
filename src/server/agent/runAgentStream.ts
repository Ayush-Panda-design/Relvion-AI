import type { FunctionDeclaration } from '@google/generative-ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  createSseEmitter,
  inferStepFromTool,
  parseToolResultForPanel,
  sleep,
  type AgentStreamEvent,
} from '@/lib/agent-stream';

type RunAgentParams = {
  message: string;
  history: { role: string; parts: { text: string }[] }[];
  attachments: { name: string; mimeType: string; data: string; size: number }[];
  apiKeys: string[];
  geminiDeclarations: FunctionDeclaration[];
  handlerMap: Map<string, (args: unknown) => Promise<string>>;
  systemInstruction: string;
  emit: (event: AgentStreamEvent) => void;
};

const MODEL = 'gemini-2.5-flash';
const MAX_TOOL_LOOPS = 10;
const MAX_RESULT_CHARS = 8_000;

let keyIndex = 0;
function nextApiKey(keys: string[]): string {
  const key = keys[keyIndex % keys.length];
  keyIndex = (keyIndex + 1) % keys.length;
  return key;
}

function extractToolText(result: unknown): string {
  if (typeof result === 'string') return result;
  return JSON.stringify(result) ?? 'null';
}

function chunkText(text: string, size = 4): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return chunks;
}

export async function runAgentStream(params: RunAgentParams): Promise<void> {
  const {
    message,
    history,
    attachments,
    apiKeys,
    geminiDeclarations,
    handlerMap,
    systemInstruction,
    emit,
  } = params;

  const understandId = 'step-understand';
  emit({ type: 'step', id: understandId, label: 'Understanding request', icon: 'brain', status: 'active' });
  await sleep(280);
  emit({ type: 'step', id: understandId, label: 'Understanding request', icon: 'brain', status: 'done' });

  const makeModel = (apiKey: string) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction,
      tools: [{ functionDeclarations: geminiDeclarations }],
      generationConfig: { temperature: 0.2 },
    });
  };

  let model = makeModel(nextApiKey(apiKeys));
  let chat = model.startChat({ history });

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
          model = makeModel(nextApiKey(apiKeys));
          chat = model.startChat({ history });
        } else {
          await sleep(is503 ? (attempt + 1) * 5_000 : (attempt + 1) * 10_000);
        }
      }
    }
    throw lastErr;
  }

  const messageParts: any[] = [];
  if (message?.trim()) messageParts.push({ text: message });
  for (const att of attachments) {
    messageParts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
    messageParts.push({
      text: `[Attached file: ${att.name} (${att.mimeType}, ${Math.round(att.size / 1024)}KB)]`,
    });
  }
  if (messageParts.length === 0) messageParts.push({ text: message || 'Hello' });

  let result = await sendWithRotation(() => chat.sendMessage(messageParts), 'initial message');
  let call = result.response.functionCalls()?.[0];

  let loops = 0;
  while (call && loops < MAX_TOOL_LOOPS) {
    loops++;
    const stepId = `step-${loops}-${call.name}`;
    const { label, icon } = inferStepFromTool(call.name, call.args);

    emit({ type: 'step', id: stepId, label, icon, status: 'active' });

    const handler = handlerMap.get(call.name);
    if (!handler) {
      emit({ type: 'step', id: stepId, label, icon, status: 'error' });
      result = await sendWithRotation(
        () =>
          chat.sendMessage([
            {
              functionResponse: {
                name: call!.name,
                response: { error: `Tool "${call!.name}" is not available.` },
              },
            },
          ]),
        `tool-response (unknown: ${call.name})`
      );
      call = result.response.functionCalls()?.[0];
      continue;
    }

    let responseObj: Record<string, string>;
    try {
      const toolResult = await Promise.resolve(handler(call.args));
      const raw = extractToolText(toolResult);
      const truncated =
        raw.length > MAX_RESULT_CHARS
          ? raw.slice(0, MAX_RESULT_CHARS) + '\n\n[... result truncated ...]'
          : raw;
      responseObj = { result: truncated };

      if (call.name === 'run_script' && !raw.includes('"isError"') && !raw.includes('"error"')) {
        const code = String((call.args as { code?: string })?.code ?? '');
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

      const panel = parseToolResultForPanel(call.name, raw, 'success');
      emit({
        type: 'tool_result',
        name: call.name,
        label: panel.label,
        status: 'success',
        result: { raw: raw.slice(0, 2000), fields: panel.fields, preview: panel.preview },
        summary: panel.summary,
      });
      emit({ type: 'step', id: stepId, label, icon, status: 'done' });
    } catch (toolErr: unknown) {
      const errMsg = (toolErr as Error)?.message ?? 'Tool execution failed';
      responseObj = { error: errMsg };
      emit({
        type: 'tool_result',
        name: call.name,
        label,
        status: 'error',
        result: { error: errMsg },
      });
      emit({ type: 'step', id: stepId, label, icon, status: 'error' });
    }

    try {
      result = await sendWithRotation(
        () =>
          chat.sendMessage([
            {
              functionResponse: { name: call!.name, response: responseObj },
            },
          ]),
        `tool-response (${call.name})`
      );
      call = result.response.functionCalls()?.[0];
    } catch {
      result = await sendWithRotation(
        () =>
          chat.sendMessage(
            `Tool "${call!.name}" returned: ${JSON.stringify(responseObj).slice(0, 2_000)}`
          ),
        'fallback plain text'
      );
      call = null;
    }
  }

  const text =
    result.response.text()?.trim() ||
    "I processed your request but didn't generate a response. Please try rephrasing.";

  const draftId = 'step-draft';
  if (loops > 0) {
    emit({ type: 'step', id: draftId, label: 'Composing reply', icon: 'mail', status: 'active' });
    await sleep(200);
  }

  for (const chunk of chunkText(text)) {
    emit({ type: 'token', text: chunk });
    await sleep(12);
  }

  if (loops > 0) {
    emit({ type: 'step', id: draftId, label: 'Composing reply', icon: 'mail', status: 'done' });
  }

  emit({ type: 'done' });
}

export function sseResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

export function createAgentSseStream(run: (emit: (e: AgentStreamEvent) => void) => Promise<void>) {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = createSseEmitter(controller);
      try {
        await run(emit);
      } catch (err: unknown) {
        const msg = (err as Error)?.message ?? 'Agent failed';
        emit({ type: 'error', message: msg });
        emit({ type: 'done' });
      } finally {
        controller.close();
      }
    },
  });
}

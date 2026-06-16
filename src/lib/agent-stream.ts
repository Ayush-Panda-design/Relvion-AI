/** SSE event types for the agent chat stream */

export type AgentStepIcon =
  | 'brain'
  | 'search'
  | 'user'
  | 'mail'
  | 'send'
  | 'calendar'
  | 'schema'
  | 'code'
  | 'check';

export type AgentStreamEvent =
  | { type: 'step'; id: string; label: string; icon: AgentStepIcon; status: 'active' | 'done' | 'error' }
  | {
      type: 'tool_result';
      name: string;
      label: string;
      status: 'success' | 'error';
      result: Record<string, unknown>;
      summary?: string;
    }
  | { type: 'token'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export type AgentStep = {
  id: string;
  label: string;
  icon: AgentStepIcon;
  status: 'pending' | 'active' | 'done' | 'error';
  timestamp: string;
  detail?: string;
  toolName?: string;
  expanded?: boolean;
};

export type LastActionData = {
  name: string;
  label: string;
  status: 'success' | 'error';
  fields: { key: string; value: string }[];
  preview?: string;
  summary?: string;
  timestamp: string;
};

export function formatAgentTime(d = new Date()) {
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function inferStepFromTool(name: string, args?: unknown): { label: string; icon: AgentStepIcon } {
  if (name === 'list_operations') {
    return { label: 'Understanding capabilities', icon: 'brain' };
  }
  if (name === 'get_schema') {
    return { label: 'Reading API schema', icon: 'schema' };
  }
  if (name === 'run_script') {
    const code = String((args as { code?: string })?.code ?? '').toLowerCase();
    if (code.includes('messages.send') || code.includes('messages.create')) {
      return { label: 'Sending via Gmail', icon: 'send' };
    }
    if (code.includes('messages.list') || code.includes('messages.get') || code.includes('threads')) {
      return { label: 'Searching inbox', icon: 'search' };
    }
    if (code.includes('googlecalendar') || code.includes('events.')) {
      if (code.includes('.create') || code.includes('.update')) {
        return { label: 'Updating calendar', icon: 'calendar' };
      }
      return { label: 'Checking calendar', icon: 'calendar' };
    }
    if (code.includes('search') || code.includes('find')) {
      return { label: 'Searching for contact', icon: 'search' };
    }
    if (code.includes('draft')) {
      return { label: 'Drafting email', icon: 'mail' };
    }
    return { label: 'Running action', icon: 'code' };
  }
  return { label: name.replace(/_/g, ' '), icon: 'code' };
}

export function parseToolResultForPanel(
  name: string,
  raw: string,
  status: 'success' | 'error'
): LastActionData {
  const { label } = inferStepFromTool(name);
  const fields: { key: string; value: string }[] = [];
  let preview: string | undefined;
  let summary: string | undefined;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const result = (parsed.result ?? parsed) as Record<string, unknown>;

    if (typeof result === 'object' && result !== null) {
      if (result.id) fields.push({ key: 'Message ID', value: String(result.id).slice(0, 16) + '…' });
      if (result.threadId) fields.push({ key: 'Thread', value: String(result.threadId).slice(0, 12) + '…' });
      if (result.summary) fields.push({ key: 'Subject', value: String(result.summary) });
      if (Array.isArray(result.attendees)) {
        const emails = result.attendees
          .map((a) => (typeof a === 'object' && a && 'email' in a ? String((a as { email: string }).email) : ''))
          .filter(Boolean);
        if (emails.length) fields.push({ key: 'To', value: emails.join(', ') });
      }
      if (result.snippet) preview = String(result.snippet);
    }
  } catch {
    const toMatch = raw.match(/To:\s*([^\r\n]+)/i);
    const subMatch = raw.match(/Subject:\s*([^\r\n]+)/i);
    if (toMatch) fields.push({ key: 'To', value: toMatch[1].trim() });
    if (subMatch) fields.push({ key: 'Subject', value: subMatch[1].trim() });
    if (raw.length < 500) preview = raw;
  }

  if (name === 'run_script') {
    fields.push({ key: 'Provider', value: raw.toLowerCase().includes('calendar') ? 'Google Calendar' : 'Gmail' });
  }
  fields.push({ key: 'Status', value: status === 'success' ? 'Sent' : 'Failed' });

  summary = status === 'success'
    ? `The assistant completed ${label.toLowerCase()}.`
    : `The assistant attempted ${label.toLowerCase()} but encountered an issue.`;

  return {
    name,
    label,
    status,
    fields,
    preview,
    summary,
    timestamp: formatAgentTime(),
  };
}

export function createSseEmitter(controller: ReadableStreamDefaultController<Uint8Array>) {
  const encoder = new TextEncoder();
  return (event: AgentStreamEvent) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
  };
}

export async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

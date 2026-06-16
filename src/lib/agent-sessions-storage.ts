import type { AgentChatMessage } from '@/lib/agent-session';

export type StoredAgentSession = {
  id: string;
  label: string;
  updatedAt: number;
  messages: AgentChatMessage[];
};

const SESSIONS_KEY = 'relvion_agent_sessions';
const MAX_SESSIONS = 12;

export function loadAgentSessions(): StoredAgentSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredAgentSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAgentSessions(sessions: StoredAgentSession[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
  } catch {}
}

export function sessionLabelFromMessages(messages: AgentChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user' && m.content.trim());
  if (!firstUser) return 'New conversation';
  const text = firstUser.content.trim();
  return text.length > 36 ? `${text.slice(0, 36)}…` : text;
}

export function buildTranscript(messages: AgentChatMessage[]): string {
  return messages
    .filter((m) => m.content.trim() && !m.streaming)
    .map((m) => {
      const who = m.role === 'user' ? 'You' : 'Relvion';
      const ts = m.timestamp ? ` (${m.timestamp})` : '';
      return `${who}${ts}:\n${m.content}`;
    })
    .join('\n\n---\n\n');
}

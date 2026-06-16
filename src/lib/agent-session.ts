export type AgentChatMessage = {
  role: 'user' | 'agent';
  content: string;
  attachments?: { name: string; type: string; preview?: string }[];
};

/** In-memory chat history so the agent panel does not reset when routes change. */
let sessionMessages: AgentChatMessage[] | null = null;

export function getAgentSessionMessages(): AgentChatMessage[] | null {
  return sessionMessages;
}

export function setAgentSessionMessages(messages: AgentChatMessage[]) {
  sessionMessages = messages;
}

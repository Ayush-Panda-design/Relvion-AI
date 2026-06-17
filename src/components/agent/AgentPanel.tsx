'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, Image, FileText, Film, Music, File, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAgentSessionMessages, setAgentSessionMessages } from '@/lib/agent-session';
import {
  buildTranscript,
  loadAgentSessions,
  saveAgentSessions,
  sessionLabelFromMessages,
  type StoredAgentSession,
} from '@/lib/agent-sessions-storage';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import { ChatMessage, type ChatMessageData } from '@/components/ui/chat-message';
import { AgentHeader, type AgentStatus } from '@/components/agent/AgentHeader';
import { AgentEmptyState } from '@/components/agent/AgentEmptyState';
import { AgentInputBar } from '@/components/agent/AgentInputBar';
import { LastActionPanel } from '@/components/agent/LastActionPanel';
import {
  formatAgentTime,
  parseToolResultForPanel,
  type AgentStep,
  type AgentStreamEvent,
  type LastActionData,
} from '@/lib/agent-stream';
import { useWorkspaceShell } from '@/contexts/workspace-shell';

const STORAGE_KEY = 'relvion_agent_history';
const WIDTH_STORAGE_KEY = 'relvion_agent_width';
const MIN_PANEL_WIDTH = 260;
const MAX_PANEL_WIDTH = 640;
const DEFAULT_PANEL_WIDTH = 300;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
  return File;
}

function isRealChat(messages: ChatMessageData[]) {
  return messages.some((m) => m.role === 'user');
}

function newSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function consumeAgentStream(
  res: Response,
  onEvent: (event: AgentStreamEvent) => void
): Promise<void> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';
    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith('data:')) continue;
      try {
        onEvent(JSON.parse(line.slice(5).trim()) as AgentStreamEvent);
      } catch {}
    }
  }
}

export function AgentPanel() {
  const { agentOpen, openAgent, closeAgent } = useWorkspaceShell();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessageData[]>(
    () => getAgentSessionMessages() ?? []
  );
  const [loaded, setLoaded] = useState(() => getAgentSessionMessages() !== null);
  const [sending, setSending] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle');
  const [lastAction, setLastAction] = useState<LastActionData | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<Map<string, string>>(new Map());
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [sessions, setSessions] = useState<StoredAgentSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState(() => newSessionId());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const liveStepsRef = useRef<AgentStep[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WIDTH_STORAGE_KEY);
      if (saved) {
        const w = Number.parseInt(saved, 10);
        if (!Number.isNaN(w)) setPanelWidth(Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, w)));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(WIDTH_STORAGE_KEY, String(panelWidth));
    } catch {}
  }, [panelWidth]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      setPanelWidth(Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, window.innerWidth - e.clientX)));
    };
    const onUp = () => setIsResizing(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  useEffect(() => {
    if (loaded) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          setAgentSessionMessages(parsed);
        }
      }
    } catch {}
    setLoaded(true);
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;
    setAgentSessionMessages(messages);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages, loaded]);

  useEffect(() => {
    if (!loaded) return;
    setSessions(loadAgentSessions());
  }, [loaded]);

  useEffect(() => {
    if (!loaded || !isRealChat(messages)) return;
    const label = sessionLabelFromMessages(messages);
    const snapshot = messages.filter((m) => !m.streaming);
    setSessions((prev) => {
      const next = [...prev];
      const idx = next.findIndex((s) => s.id === currentSessionId);
      const entry: StoredAgentSession = {
        id: currentSessionId,
        label,
        updatedAt: Date.now(),
        messages: snapshot,
      };
      if (idx >= 0) next[idx] = entry;
      else next.unshift(entry);
      next.sort((a, b) => b.updatedAt - a.updatedAt);
      saveAgentSessions(next);
      return next;
    });
  }, [messages, loaded, currentSessionId]);

  const sessionLabel = useMemo(
    () => (isRealChat(messages) ? sessionLabelFromMessages(messages) : 'New conversation'),
    [messages]
  );

  const historyItems = useMemo(
    () =>
      messages
        .filter((m) => m.role === 'user' && m.content.trim())
        .map((m, i) => ({
          id: `hist_${i}_${m.timestamp ?? ''}`,
          preview: m.content.trim(),
          timestamp: m.timestamp,
        })),
    [messages]
  );

  const persistCurrentSession = useCallback(() => {
    if (!isRealChat(messages)) return;
    const snapshot = messages.filter((m) => !m.streaming);
    setSessions((prev) => {
      const next = [...prev];
      const idx = next.findIndex((s) => s.id === currentSessionId);
      const entry: StoredAgentSession = {
        id: currentSessionId,
        label: sessionLabelFromMessages(snapshot),
        updatedAt: Date.now(),
        messages: snapshot,
      };
      if (idx >= 0) next[idx] = entry;
      else next.unshift(entry);
      next.sort((a, b) => b.updatedAt - a.updatedAt);
      saveAgentSessions(next);
      return next;
    });
  }, [messages, currentSessionId]);

  const startNewConversation = useCallback(() => {
    persistCurrentSession();
    setMessages([]);
    setAgentSessionMessages([]);
    setInput('');
    setAttachedFiles([]);
    setLastAction(null);
    setAgentStatus('idle');
    setCurrentSessionId(newSessionId());
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {}
  }, [persistCurrentSession]);

  const loadSession = useCallback(
    (id: string) => {
      const session = sessions.find((s) => s.id === id);
      if (!session) return;
      persistCurrentSession();
      setMessages(session.messages);
      setAgentSessionMessages(session.messages);
      setCurrentSessionId(id);
      setLastAction(null);
      setAgentStatus('idle');
    },
    [sessions, persistCurrentSession]
  );

  const copyTranscript = useCallback(async () => {
    const text = buildTranscript(messages.filter((m) => !m.streaming));
    if (!text.trim()) {
      toast.error('Nothing to copy yet');
      return;
    }
    await navigator.clipboard.writeText(text);
    toast.success('Transcript copied');
  }, [messages]);

  const shareTranscript = useCallback(async () => {
    const text = buildTranscript(messages.filter((m) => !m.streaming));
    if (!text.trim()) {
      toast.error('Nothing to share yet');
      return;
    }
    if (navigator.share) {
      await navigator.share({ title: 'Relvion conversation', text });
      toast.success('Shared');
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Transcript copied to clipboard');
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setAgentSessionMessages([]);
    setLastAction(null);
    setAgentStatus('idle');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {}
    toast.success('Chat cleared');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    const newPreviews = new Map<string, string>();
    attachedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        newPreviews.set(file.name + file.size, URL.createObjectURL(file));
      }
    });
    setFilePreviews(newPreviews);
    return () => newPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [attachedFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) => f.size <= 10 * 1024 * 1024);
    setAttachedFiles((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = '';
  };

  const sendMessage = async (text: string, files = attachedFiles) => {
    if (!text.trim() && files.length === 0) return;

    const userMsg: ChatMessageData = {
      role: 'user',
      content: text,
      timestamp: formatAgentTime(),
      attachments: files.map((f) => ({
        name: f.name,
        type: f.type,
        preview: filePreviews.get(f.name + f.size),
      })),
    };

    const historyForApi = messages.filter((m) => !m.streaming);
    const agentPlaceholder: ChatMessageData = {
      role: 'agent',
      content: '',
      streaming: true,
      steps: [],
      timestamp: formatAgentTime(),
    };

    liveStepsRef.current = [];
    setMessages((prev) => [...prev, userMsg, agentPlaceholder]);
    setInput('');
    setAttachedFiles([]);
    setSending(true);
    setAgentStatus('thinking');

    try {
      const fileData = await Promise.all(
        files.map(async (file) => {
          const buffer = await file.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          return { name: file.name, mimeType: file.type || 'application/octet-stream', data: base64, size: file.size };
        })
      );

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:
            text ||
            (fileData.length > 0
              ? `I'm sharing ${fileData.length} file(s): ${fileData.map((f) => f.name).join(', ')}.`
              : ''),
          history: historyForApi.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          })),
          attachments: fileData.length > 0 ? fileData : undefined,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream')) {
        const data = await res.json();
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'agent',
            content: data.reply || 'Sorry, something went wrong.',
            timestamp: formatAgentTime(),
          };
          return next;
        });
        setAgentStatus('done');
        return;
      }

      let streamedText = '';

      await consumeAgentStream(res, (event) => {
        if (event.type === 'step') {
          const idx = liveStepsRef.current.findIndex((s) => s.id === event.id);
          const step: AgentStep = {
            id: event.id,
            label: event.label,
            icon: event.icon,
            status: event.status === 'active' ? 'active' : event.status === 'done' ? 'done' : 'error',
            timestamp: formatAgentTime(),
          };
          if (idx >= 0) liveStepsRef.current[idx] = { ...liveStepsRef.current[idx], ...step };
          else liveStepsRef.current.push(step);

          if (event.label.toLowerCase().includes('gmail') || event.label.toLowerCase().includes('inbox')) {
            setAgentStatus('using-gmail');
          } else if (event.label.toLowerCase().includes('calendar')) {
            setAgentStatus('using-calendar');
          } else if (event.status === 'active') {
            setAgentStatus('thinking');
          }

          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === 'agent') {
              next[next.length - 1] = { ...last, steps: [...liveStepsRef.current] };
            }
            return next;
          });
        }

        if (event.type === 'tool_result') {
          const panel = parseToolResultForPanel(
            event.name,
            JSON.stringify(event.result),
            event.status
          );
          panel.summary = event.summary || panel.summary;
          setLastAction(panel);

          liveStepsRef.current = liveStepsRef.current.map((s) =>
            s.toolName ? s : { ...s, toolName: event.name, detail: event.label }
          );
        }

        if (event.type === 'token') {
          streamedText += event.text;
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === 'agent') {
              next[next.length - 1] = {
                ...last,
                content: streamedText,
                streaming: true,
                steps: [...liveStepsRef.current],
              };
            }
            return next;
          });
        }

        if (event.type === 'error') {
          streamedText += event.message;
        }

        if (event.type === 'done') {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              role: 'agent',
              content: streamedText || 'Done.',
              streaming: false,
              steps: liveStepsRef.current.map((s) => ({ ...s, status: s.status === 'active' ? 'done' : s.status })),
              timestamp: formatAgentTime(),
            };
            return next;
          });
          setAgentStatus('done');
          setTimeout(() => setAgentStatus('idle'), 2000);
        }
      });
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'agent',
          content: 'Network error — please try again.',
          streaming: false,
          timestamp: formatAgentTime(),
        };
        return next;
      });
      setAgentStatus('idle');
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => sendMessage(input, attachedFiles);
  const showEmpty = !isRealChat(messages) && !sending;

  const panelBody = (mobile?: boolean) => (
    <>
      {!mobile && (
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={startResize}
          onDoubleClick={() => setPanelWidth(DEFAULT_PANEL_WIDTH)}
          className={cn(
            'absolute left-0 top-0 z-10 h-full w-3 -translate-x-1/2 cursor-col-resize',
            isResizing ? dash.resizeHandleActive : dash.resizeHandle
          )}
        />
      )}

      {mobile && (
        <div className={cn('flex shrink-0 items-center justify-between border-b px-3 py-2.5', dash.border)}>
          <span className={cn('text-sm font-semibold', dash.text)}>AI Assistant</span>
          <button
            type="button"
            onClick={closeAgent}
            className={cn('rounded-full p-2', dash.hover, dash.textMuted)}
            aria-label="Close assistant"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <AgentHeader
        status={agentStatus}
        sessionLabel={sessionLabel}
        sessions={sessions.map((s) => ({ id: s.id, label: s.label, updatedAt: s.updatedAt }))}
        currentSessionId={currentSessionId}
        historyItems={historyItems}
        onNewConversation={startNewConversation}
        onSelectSession={loadSession}
        onHistorySelect={(id) => {
          const item = historyItems.find((h) => h.id === id);
          if (item) setInput(item.preview);
        }}
        onShare={shareTranscript}
        onClear={clearChat}
        onCopyTranscript={copyTranscript}
      />

      <div className="relative z-0 min-h-0 flex-1 overflow-hidden">
        <div className="h-full space-y-5 overflow-y-auto p-3">
          {showEmpty ? (
            <AgentEmptyState onQuickAction={(p) => sendMessage(p, [])} />
          ) : (
            <>
              {messages.map((m, i) => (
                <div key={`${i}-${m.timestamp}`}>
                  <ChatMessage message={m} index={i} />
                </div>
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <LastActionPanel action={lastAction} onClose={() => setLastAction(null)} />
      </div>

      {attachedFiles.length > 0 && (
        <div className={cn('border-t px-3 py-2', dash.glassToolbar, dash.border)}>
          <div className="flex flex-wrap gap-1.5">
            {attachedFiles.map((file, i) => {
              const Icon = getFileIcon(file.type);
              const preview = filePreviews.get(file.name + file.size);
              return (
                <div key={i} className={cn('flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px]', dash.chatAttachment)}>
                  {preview ? <img src={preview} alt="" className="h-4 w-4 rounded object-cover" /> : <Icon size={12} className={dash.accent} />}
                  <span className={cn('max-w-[72px] truncate', dash.text)}>{file.name}</span>
                  <button type="button" onClick={() => setAttachedFiles((p) => p.filter((_, j) => j !== i))}>
                    <X size={10} className={dash.textMuted} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AgentInputBar
        input={input}
        setInput={setInput}
        sending={sending}
        attachedCount={attachedFiles.length}
        onAttach={() => fileInputRef.current?.click()}
        onSend={handleSend}
        onClearFiles={() => setAttachedFiles([])}
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
        showQuickActions={!input.trim() && attachedFiles.length === 0}
        onQuickAction={(p) => sendMessage(p, [])}
      />
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={openAgent}
        className={cn(
          'fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 lg:hidden',
          dash.accentBg
        )}
        aria-label="Open AI assistant"
      >
        <Bot size={22} className="text-white" />
      </button>

      <aside
        style={{ width: panelWidth }}
        className={cn(
          'relative z-20 hidden h-screen shrink-0 flex-col overflow-hidden border-l lg:flex',
          dash.agentPanel,
          dash.border
        )}
      >
        {panelBody()}
      </aside>

      <AnimatePresence>
        {agentOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close assistant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
              onClick={closeAgent}
            />
            <motion.aside
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 38 }}
              className={cn(
                'fixed inset-0 z-50 flex flex-col overflow-hidden lg:hidden',
                dash.agentPanel,
                dash.border
              )}
            >
              {panelBody(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

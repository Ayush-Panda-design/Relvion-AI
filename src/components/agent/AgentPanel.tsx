'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, Zap, X, Image, FileText, Film, Music, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAgentSessionMessages, setAgentSessionMessages } from '@/lib/agent-session';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import { ThinkingLoader } from '@/components/dashboard/loading/DashboardLoaders';
import { ChatMessage } from '@/components/ui/chat-message';

const STORAGE_KEY = 'relvion_agent_history';
const WIDTH_STORAGE_KEY = 'relvion_agent_width';
const MIN_PANEL_WIDTH = 260;
const MAX_PANEL_WIDTH = 640;
const DEFAULT_PANEL_WIDTH = 300;

interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  attachments?: { name: string; type: string; preview?: string }[];
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  { role: 'agent', content: 'Hello! I\'m your Relvion AI Assistant. You can send me images, documents, or other files and I\'ll analyze them for you. How can I help you today?' }
];

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

export function AgentPanel() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => getAgentSessionMessages() ?? DEFAULT_MESSAGES
  );
  const [loaded, setLoaded] = useState(() => getAgentSessionMessages() !== null);
  const [sending, setSending] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<Map<string, string>>(new Map());
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WIDTH_STORAGE_KEY);
      if (saved) {
        const w = Number.parseInt(saved, 10);
        if (!Number.isNaN(w)) {
          setPanelWidth(Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, w)));
        }
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
      const next = window.innerWidth - e.clientX;
      setPanelWidth(Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, next)));
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

  const resetPanelWidth = useCallback(() => {
    setPanelWidth(DEFAULT_PANEL_WIDTH);
  }, []);

  // Load persisted history on first mount only (session cache avoids reload on route changes)
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

  // Persist history whenever it changes (skip until initial load has run)
  useEffect(() => {
    if (!loaded) return;
    setAgentSessionMessages(messages);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages, loaded]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate previews for image files
  useEffect(() => {
    const newPreviews = new Map<string, string>();
    attachedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newPreviews.set(file.name + file.size, url);
      }
    });
    setFilePreviews(newPreviews);

    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [attachedFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit total to 5 files, 10MB each
    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
    if (validFiles.length < files.length) {
      // Some files were too large - silently skip them
    }

    setAttachedFiles(prev => [...prev, ...validFiles].slice(0, 5));
    e.target.value = ''; // Reset input
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;

    // Build the user message for display
    const userMsg: ChatMessage = {
      role: 'user',
      content: input,
      attachments: attachedFiles.map(f => ({
        name: f.name,
        type: f.type,
        preview: filePreviews.get(f.name + f.size),
      })),
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    const currentInput = input;
    const currentFiles = [...attachedFiles];
    setInput('');
    setAttachedFiles([]);
    setSending(true);

    try {
      // Convert files to base64 for the API
      const fileData = await Promise.all(
        currentFiles.map(async (file) => {
          const buffer = await file.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          return {
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            data: base64,
            size: file.size,
          };
        })
      );

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput || (fileData.length > 0 ? `I'm sharing ${fileData.length} file(s): ${fileData.map(f => f.name).join(', ')}. Please analyze them.` : ''),
          history: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          })),
          attachments: fileData.length > 0 ? fileData : undefined,
        }),
      });
      const data = await res.json();
      setMessages([...newMsgs, { role: 'agent', content: data.reply || 'Sorry, I encountered an error.' }]);
    } catch (e) {
      setMessages([...newMsgs, { role: 'agent', content: 'Network error.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <aside
      style={{ width: panelWidth }}
      className={cn(
        'relative z-20 flex h-screen shrink-0 flex-col border-l',
        dash.sidebar,
        dash.border
      )}
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize AI assistant panel"
        onMouseDown={startResize}
        onDoubleClick={resetPanelWidth}
        title="Drag to resize · double-click to reset"
        className={cn(
          'absolute left-0 top-0 z-10 h-full w-3 -translate-x-1/2 cursor-col-resize transition-colors',
          isResizing ? dash.resizeHandleActive : cn('bg-transparent', dash.resizeHandle)
        )}
      />

      <div className={cn('flex h-14 shrink-0 items-center gap-2 border-b px-4', dash.glassToolbar, dash.border)}>
        <Zap size={18} className={cn('animate-pulse', dash.accent)} />
        <h2 className={cn('truncate font-semibold tracking-tight', dash.text)}>AI Assistant</h2>
        <div className="relative ml-auto flex h-2.5 w-2.5 items-center justify-center">
          <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping', dash.online)} />
          <span className={cn('relative inline-flex h-2 w-2 rounded-full', dash.online)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <ChatMessage key={`${i}-${m.content.slice(0, 24)}`} message={m} index={i} />
          ))}
        </AnimatePresence>
        {sending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start pl-11"
          >
            <div className={cn('rounded-2xl rounded-bl-md border px-4 py-2.5 text-sm backdrop-blur-sm', dash.chatAgent)}>
              <ThinkingLoader />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attached files preview */}
      {attachedFiles.length > 0 && (
        <div className={cn('animate-[fadeSlideIn_0.25s_ease-out] border-t px-4 py-2', dash.glassToolbar, dash.border)}>
          <div className="flex flex-wrap gap-1.5">
            {attachedFiles.map((file, i) => {
              const Icon = getFileIcon(file.type);
              const preview = filePreviews.get(file.name + file.size);
              return (
                <div key={i} className={cn('group relative flex items-center gap-1.5 rounded-lg px-2 py-1 transition-all duration-200 hover:scale-[1.03]', dash.chatAttachment)}>
                  {preview ? (
                    <img src={preview} alt={file.name} className="h-5 w-5 rounded object-cover" />
                  ) : (
                    <Icon size={12} className={cn('shrink-0', dash.accent)} />
                  )}
                  <div className="flex flex-col">
                    <span className={cn('max-w-[80px] truncate text-[10px] leading-tight', dash.text)}>{file.name}</span>
                    <span className="text-[9px] leading-tight text-[#16a34a] dark:text-[#22c55e]">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className={cn('ml-0.5 transition-colors duration-200 hover:rotate-90', dash.textMuted, dash.accentHover)}
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={cn('border-t p-4 backdrop-blur-md', dash.glassToolbar, dash.border)}>
        <div className={cn('relative flex items-center gap-1 rounded-2xl border p-1 shadow-sm backdrop-blur-sm dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)]', dash.border)}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn('relative shrink-0 rounded-lg p-1.5 transition-all duration-200 hover:scale-110', dash.textMuted, dash.hover, dash.accentHover)}
            title="Attach files (images, docs, etc.)"
          >
            <Paperclip size={16} />
            {attachedFiles.length > 0 && (
              <span className={cn('absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 animate-[fadeSlideIn_0.2s_ease-out] items-center justify-center rounded-full text-[8px] font-bold text-white', dash.accentBg)}>
                {attachedFiles.length}
              </span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.txt,.csv,.json,.md,video/*,audio/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={attachedFiles.length > 0 ? 'Add a message...' : 'Ask anything...'}
            disabled={sending}
            className={cn(
              'flex-1 rounded-xl border py-2.5 pl-3 pr-8 text-sm transition-all focus:outline-none disabled:opacity-50',
              dash.input,
              dash.text,
              'placeholder:text-[#7A7770] focus:ring-2 dark:placeholder:text-white/40',
              dash.accentRing,
            )}
          />
          <button
            onClick={handleSend}
            disabled={sending && !input.trim() && attachedFiles.length === 0}
            className={cn('absolute right-2 top-1/2 -translate-y-1/2 p-1 transition-all duration-150 hover:scale-110 active:scale-95 disabled:opacity-30', dash.accent, dash.accentHover)}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className={cn('text-[9px]', dash.textSubtle)}>Images, PDFs, docs up to 10MB</span>
          {attachedFiles.length > 0 && (
            <button
              onClick={() => setAttachedFiles([])}
              className={cn('text-[9px] transition-colors duration-200', dash.accent, dash.accentHover)}
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
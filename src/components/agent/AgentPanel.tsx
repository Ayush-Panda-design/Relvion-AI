'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, Zap, X, Image, FileText, Film, Music, File, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAgentSessionMessages, setAgentSessionMessages } from '@/lib/agent-session';

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

function CopyMessageButton({ text, isUser }: { text: string; isUser: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(isUser ? 'Prompt copied' : 'Response copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  }, [text, isUser]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={isUser ? 'Copy prompt' : 'Copy response'}
      className={`absolute -top-2 rounded-md border border-[#5f6368]/50 bg-[#3c4043] p-1 text-white/70 opacity-0 shadow-sm transition-opacity hover:bg-[#292a2d] hover:text-[#8ab4f8] group-hover/message:opacity-100 ${
        isUser ? '-left-1' : '-right-1'
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-[fadeSlideIn_0.35s_ease-out]`}
    >
      {message.attachments && message.attachments.length > 0 && (
        <div
          className={`mb-1.5 flex max-w-[90%] flex-wrap gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
          {message.attachments.map((att, j) => (
            <div key={j} className="group relative transition-transform duration-200 hover:scale-105">
              {att.type.startsWith('image/') && att.preview ? (
                <div className="h-[80px] w-[80px] overflow-hidden rounded-lg border border-[#3c4043] bg-[#292a2d] transition-all duration-200 hover:border-[#8ab4f8]">
                  <img src={att.preview} alt={att.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-lg border border-[#3c4043] bg-[#292a2d] px-2 py-1.5 transition-all duration-200 hover:border-[#8ab4f8]">
                  {(() => {
                    const Icon = getFileIcon(att.type);
                    return <Icon size={12} className="shrink-0 text-[#8ab4f8]" />;
                  })()}
                  <span className="max-w-[60px] truncate text-[10px] text-white">{att.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {message.content && (
        <div className={`group/message relative max-w-[90%] ${isUser ? 'pr-1' : 'pl-1'}`}>
          <CopyMessageButton text={message.content} isUser={isUser} />
          <div
            className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm [overflow-wrap:anywhere] transition-all duration-200 ${
              isUser
                ? 'rounded-br-sm bg-[#8ab4f8] text-[#202124] shadow-[0_0_12px_rgba(138,180,248,0.25)]'
                : 'rounded-bl-sm border border-[#3c4043] bg-[#292a2d] text-white hover:border-[#3a3a3a]'
            }`}
          >
            {message.content}
          </div>
        </div>
      )}
    </div>
  );
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
      className="relative flex h-screen shrink-0 flex-col border-l border-[#3c4043] bg-[#202124]"
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize AI assistant panel"
        onMouseDown={startResize}
        onDoubleClick={resetPanelWidth}
        title="Drag to resize · double-click to reset"
        className={`absolute left-0 top-0 z-10 h-full w-3 -translate-x-1/2 cursor-col-resize transition-colors ${
          isResizing ? 'bg-[#8ab4f8]/40' : 'bg-transparent hover:bg-[#8ab4f8]/25'
        }`}
      />

      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-[#3c4043] bg-[#202124] px-4">
        <Zap size={18} className="animate-pulse text-[#8ab4f8]" />
        <h2 className="truncate font-semibold tracking-tight text-white">AI Assistant</h2>
        <div className="relative ml-auto flex h-2.5 w-2.5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full w-2 h-2 bg-[#22c55e]"></span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
        {sending && (
          <div className="flex items-start animate-[fadeSlideIn_0.3s_ease-out]">
            <div className="px-4 py-2 rounded-2xl rounded-bl-sm bg-[#292a2d] border border-[#3c4043] text-sm text-white">
              <span className="inline-flex gap-1">
                <span className="animate-bounce text-[#8ab4f8]" style={{ animationDelay: '0ms' }}>●</span>
                <span className="animate-bounce text-[#8ab4f8]" style={{ animationDelay: '150ms' }}>●</span>
                <span className="animate-bounce text-[#8ab4f8]" style={{ animationDelay: '300ms' }}>●</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attached files preview */}
      {attachedFiles.length > 0 && (
        <div className="px-4 py-2 border-t border-[#3c4043] bg-[#202124] animate-[fadeSlideIn_0.25s_ease-out]">
          <div className="flex flex-wrap gap-1.5">
            {attachedFiles.map((file, i) => {
              const Icon = getFileIcon(file.type);
              const preview = filePreviews.get(file.name + file.size);
              return (
                <div key={i} className="relative group flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#292a2d] border border-[#3c4043] transition-all duration-200 hover:border-[#8ab4f8] hover:scale-[1.03]">
                  {preview ? (
                    <img src={preview} alt={file.name} className="w-5 h-5 rounded object-cover" />
                  ) : (
                    <Icon size={12} className="text-[#8ab4f8] shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white truncate max-w-[80px] leading-tight">{file.name}</span>
                    <span className="text-[9px] text-[#22c55e] leading-tight">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-white/60 hover:text-[#8ab4f8] transition-colors ml-0.5 hover:rotate-90 duration-200"
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-[#3c4043] bg-[#202124]">
        <div className="relative flex items-center gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-white/70 hover:text-[#8ab4f8] transition-all duration-200 p-1.5 rounded-lg hover:bg-[#292a2d] hover:scale-110 shrink-0 relative"
            title="Attach files (images, docs, etc.)"
          >
            <Paperclip size={16} />
            {attachedFiles.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#8ab4f8] text-white text-[8px] flex items-center justify-center font-bold animate-[fadeSlideIn_0.2s_ease-out]">
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
            className="flex-1 pl-3 pr-8 py-2.5 bg-[#201f1f] border border-[#3c4043] rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#8ab4f8] focus:shadow-[0_0_0_3px_rgba(138,180,248,0.15)] transition-all duration-200 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={sending && !input.trim() && attachedFiles.length === 0}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8ab4f8] hover:text-[#aecbfa] hover:scale-110 active:scale-95 transition-all duration-150 p-1 disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-[9px] text-white/40">Images, PDFs, docs up to 10MB</span>
          {attachedFiles.length > 0 && (
            <button
              onClick={() => setAttachedFiles([])}
              className="text-[9px] text-[#8ab4f8] hover:text-[#aecbfa] transition-colors duration-200"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </aside>
  );
}
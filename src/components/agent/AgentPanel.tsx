'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Zap, X, Image, FileText, Film, Music, File } from 'lucide-react';

const STORAGE_KEY = 'relvion_agent_history';

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
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);
  const [loaded, setLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<Map<string, string>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load persisted history on mount (client-only, after hydration, to avoid SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {}
    setLoaded(true);
  }, []);

  // Persist history whenever it changes (skip until initial load has run)
  useEffect(() => {
    if (!loaded) return;
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
    <aside className="w-[300px] bg-black border-l border-[#2a2a2a] flex flex-col h-screen shrink-0">
      <div className="h-[60px] border-b border-[#2a2a2a] px-4 flex items-center gap-2 shrink-0 bg-black">
        <Zap size={18} className="text-[#FF3B30] animate-pulse" />
        <h2 className="font-semibold text-white tracking-tight">AI Assistant</h2>
        <div className="ml-auto relative flex items-center justify-center w-2.5 h-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full w-2 h-2 bg-[#22c55e]"></span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-[fadeSlideIn_0.35s_ease-out]`}
          >
            {/* Attachment previews */}
            {m.attachments && m.attachments.length > 0 && (
              <div className={`flex flex-wrap gap-1.5 mb-1.5 max-w-[90%] ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.attachments.map((att, j) => (
                  <div key={j} className="relative group transition-transform duration-200 hover:scale-105">
                    {att.type.startsWith('image/') && att.preview ? (
                      <div className="w-[80px] h-[80px] rounded-lg overflow-hidden border border-[#2a2a2a] bg-[#0a0a0a] transition-all duration-200 hover:border-[#FF3B30]">
                        <img src={att.preview} alt={att.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] transition-all duration-200 hover:border-[#FF3B30]">
                        {(() => { const Icon = getFileIcon(att.type); return <Icon size={12} className="text-[#FF3B30] shrink-0" />; })()}
                        <span className="text-[10px] text-white truncate max-w-[60px]">{att.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Message text */}
            {m.content && (
              <div className={`px-4 py-2 rounded-2xl max-w-[90%] text-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere] transition-all duration-200 ${
                m.role === 'user'
                  ? 'bg-[#FF3B30] text-white rounded-br-sm shadow-[0_0_12px_rgba(255,59,48,0.25)]'
                  : 'bg-[#0a0a0a] text-white rounded-bl-sm border border-[#2a2a2a] hover:border-[#3a3a3a]'
              }`}>
                {m.content}
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex items-start animate-[fadeSlideIn_0.3s_ease-out]">
            <div className="px-4 py-2 rounded-2xl rounded-bl-sm bg-[#0a0a0a] border border-[#2a2a2a] text-sm text-white">
              <span className="inline-flex gap-1">
                <span className="animate-bounce text-[#FF3B30]" style={{ animationDelay: '0ms' }}>●</span>
                <span className="animate-bounce text-[#FF3B30]" style={{ animationDelay: '150ms' }}>●</span>
                <span className="animate-bounce text-[#FF3B30]" style={{ animationDelay: '300ms' }}>●</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attached files preview */}
      {attachedFiles.length > 0 && (
        <div className="px-4 py-2 border-t border-[#2a2a2a] bg-black animate-[fadeSlideIn_0.25s_ease-out]">
          <div className="flex flex-wrap gap-1.5">
            {attachedFiles.map((file, i) => {
              const Icon = getFileIcon(file.type);
              const preview = filePreviews.get(file.name + file.size);
              return (
                <div key={i} className="relative group flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] transition-all duration-200 hover:border-[#FF3B30] hover:scale-[1.03]">
                  {preview ? (
                    <img src={preview} alt={file.name} className="w-5 h-5 rounded object-cover" />
                  ) : (
                    <Icon size={12} className="text-[#FF3B30] shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white truncate max-w-[80px] leading-tight">{file.name}</span>
                    <span className="text-[9px] text-[#22c55e] leading-tight">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-white/60 hover:text-[#FF3B30] transition-colors ml-0.5 hover:rotate-90 duration-200"
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-[#2a2a2a] bg-black">
        <div className="relative flex items-center gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-white/70 hover:text-[#FF3B30] transition-all duration-200 p-1.5 rounded-lg hover:bg-[#0a0a0a] hover:scale-110 shrink-0 relative"
            title="Attach files (images, docs, etc.)"
          >
            <Paperclip size={16} />
            {attachedFiles.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#FF3B30] text-white text-[8px] flex items-center justify-center font-bold animate-[fadeSlideIn_0.2s_ease-out]">
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
            className="flex-1 pl-3 pr-8 py-2.5 bg-[#201f1f] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF3B30] focus:shadow-[0_0_0_3px_rgba(255,59,48,0.15)] transition-all duration-200 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={sending && !input.trim() && attachedFiles.length === 0}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FF3B30] hover:text-[#ff6b61] hover:scale-110 active:scale-95 transition-all duration-150 p-1 disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-[9px] text-white/40">Images, PDFs, docs up to 10MB</span>
          {attachedFiles.length > 0 && (
            <button
              onClick={() => setAttachedFiles([])}
              className="text-[9px] text-[#FF3B30] hover:text-[#ff6b61] transition-colors duration-200"
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
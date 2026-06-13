'use client';
import { useState, useEffect } from 'react';
import { Send, Paperclip, Zap } from 'lucide-react';

const STORAGE_KEY = 'relvion_agent_history';
const DEFAULT_MESSAGES: {role: 'user'|'agent', content: string}[] = [
  { role: 'agent', content: 'Hello! I\'m your Relvion AI Assistant. How can I help you manage your inbox or calendar today?' }
];

export function AgentPanel() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'agent', content: string}[]>(DEFAULT_MESSAGES);
  const [loaded, setLoaded] = useState(false);

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

  const handleSend = async () => {
    if(!input.trim()) return;
    const newMsgs = [...messages, {role: 'user' as const, content: input}];
    setMessages(newMsgs);
    setInput('');
    
    // Call API route
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          message: input,
          history: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          })),
        })
      });
      const data = await res.json();
      setMessages([...newMsgs, {role: 'agent', content: data.reply || 'Sorry, I encountered an error.'}]);
    } catch(e) {
      setMessages([...newMsgs, {role: 'agent', content: 'Network error.'}]);
    }
  };

  return (
    <aside className="w-[300px] bg-[#FFF59D] border-l border-[#5d460c] flex flex-col h-screen shrink-0">
      <div className="h-[60px] border-b border-[#FBC02D] px-4 flex items-center gap-2 shrink-0">
        <Zap size={18} className="text-[#D32F2F]" />
        <h2 className="font-semibold text-red-900 tracking-tight">AI Assistant</h2>
        <div className="ml-auto w-2 h-2 rounded-full bg-[#22c55e]"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`px-4 py-2 rounded-2xl max-w-[90%] text-sm ${m.role === 'user' ? 'bg-[#D32F2F] text-[#FFF9C4] rounded-br-sm' : 'bg-[#FFEE58] text-red-800 rounded-bl-sm border border-[#FBC02D]'}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[#FBC02D]">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..." 
            className="w-full pl-3 pr-10 py-2.5 bg-[#FFF176] border border-[#FBC02D] rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] transition-colors"
          />
          <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#D32F2F] hover:text-[#B71C1C] p-1">
            <Send size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
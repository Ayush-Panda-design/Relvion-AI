'use client';
import { useState } from 'react';
import { Send, Paperclip, Zap } from 'lucide-react';

export function AgentPanel() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'agent', content: string}[]>([
    { role: 'agent', content: 'Hello! I\'m your Relvion AI Assistant. How can I help you manage your inbox or calendar today?' }
  ]);

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
        body: JSON.stringify({message: input})
      });
      const data = await res.json();
      setMessages([...newMsgs, {role: 'agent', content: data.reply || 'Sorry, I encountered an error.'}]);
    } catch(e) {
      setMessages([...newMsgs, {role: 'agent', content: 'Network error.'}]);
    }
  };

  return (
    <aside className="w-[300px] bg-[#0d1425] border-l border-[#1e293b] flex flex-col h-screen shrink-0">
      <div className="h-[60px] border-b border-[#1e293b] px-4 flex items-center gap-2 shrink-0">
        <Zap size={18} className="text-[#c9a84c]" />
        <h2 className="font-semibold text-slate-100 tracking-tight">AI Assistant</h2>
        <div className="ml-auto w-2 h-2 rounded-full bg-[#22c55e]"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`px-4 py-2 rounded-2xl max-w-[90%] text-sm ${m.role === 'user' ? 'bg-[#c9a84c] text-[#0a0f1e] rounded-br-sm' : 'bg-[#1a2235] text-slate-200 rounded-bl-sm border border-[#1e293b]'}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[#1e293b]">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..." 
            className="w-full pl-3 pr-10 py-2.5 bg-[#111827] border border-[#1e293b] rounded-xl text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
          />
          <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#c9a84c] hover:text-[#d4b96a] p-1">
            <Send size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

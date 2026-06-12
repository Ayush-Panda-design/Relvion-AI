'use client';
import { useState } from 'react';
import { X, Send, Minimize2, Paperclip } from 'lucide-react';

interface ComposeModalProps {
  onClose: () => void;
}

export function ComposeModal({ onClose }: ComposeModalProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!to || !subject || !body) {
      alert('Please fill in all fields (To, Subject, Body)');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');

      alert('Email sent successfully!');
      onClose();
    } catch (error: any) {
      console.error('Send error:', error);
      alert(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-24 w-[500px] bg-[#0d1425] border border-[#1e293b] rounded-t-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a2235] px-4 py-3 flex items-center justify-between border-b border-[#1e293b]">
        <span className="text-sm font-semibold text-slate-200">New Message</span>
        <div className="flex items-center gap-2 text-slate-400">
          <button className="hover:text-slate-200 transition-colors">
            <Minimize2 size={16} />
          </button>
          <button onClick={onClose} className="hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="flex flex-col flex-1 p-2 space-y-2 bg-[#0d1425]">
        <div className="flex items-center border-b border-[#1e293b] px-2 py-1">
          <span className="text-sm text-slate-400 w-12">To:</span>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm text-slate-200 focus:outline-none focus:ring-0 placeholder-slate-600"
            placeholder="friend@corsair.dev"
          />
        </div>
        <div className="flex items-center border-b border-[#1e293b] px-2 py-1">
          <span className="text-sm text-slate-400 w-12">Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm text-slate-200 focus:outline-none focus:ring-0 placeholder-slate-600"
            placeholder="Let's catch up!"
          />
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 min-h-[300px] w-full bg-transparent border-none text-sm text-slate-200 focus:outline-none focus:ring-0 placeholder-slate-600 resize-none px-2 py-2"
          placeholder="Write your message here..."
        />
      </div>

      {/* Footer */}
      <div className="bg-[#0a0f1e] px-4 py-3 border-t border-[#1e293b] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSend}
            disabled={isSending}
            className="bg-[#c9a84c] hover:bg-[#d4b55c] text-[#0a0f1e] font-semibold py-1.5 px-6 rounded-lg transition-all flex items-center gap-2 shadow-[0_0_10px_rgba(201,168,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <span className="animate-pulse">Sending...</span>
            ) : (
              <>
                <Send size={14} /> Send
              </>
            )}
          </button>
          <button className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-md hover:bg-[#1a2235]">
            <Paperclip size={18} />
          </button>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-sm transition-colors p-1.5 rounded-md hover:bg-[#1a2235]">
          Discard
        </button>
      </div>
    </div>
  );
}

'use client';
import { Archive, Trash2, Clock, Star, Reply, CornerUpRight, MoreHorizontal, X } from 'lucide-react';

export function EmailDetail({ email, onClose }: { email: any, onClose: () => void }) {
  if (!email) return null;

  const handleAction = (action: string) => {
    // Basic mock interaction for the hackathon
    alert(`Email ${action} successfully!`);
    if (action === 'deleted' || action === 'archived') {
      onClose();
    }
  };

  return (
    <div className="w-1/2 border-l border-[#1e293b] bg-[#0d1425] h-full flex flex-col overflow-hidden">
      {/* Top Action Bar */}
      <div className="h-[60px] border-b border-[#1e293b] flex items-center justify-between px-4 shrink-0 bg-[#0a0f1e]">
        <div className="flex items-center gap-2 text-slate-400">
          <button onClick={() => handleAction('archived')} className="p-2 hover:bg-[#1a2235] hover:text-slate-200 rounded-lg transition-colors" title="Archive">
            <Archive size={18} />
          </button>
          <button onClick={() => handleAction('deleted')} className="p-2 hover:bg-[#1a2235] hover:text-red-400 rounded-lg transition-colors" title="Trash">
            <Trash2 size={18} />
          </button>
          <div className="w-px h-5 bg-[#1e293b] mx-1"></div>
          <button onClick={() => handleAction('snoozed')} className="p-2 hover:bg-[#1a2235] hover:text-slate-200 rounded-lg transition-colors" title="Snooze">
            <Clock size={18} />
          </button>
          <button className="p-2 hover:bg-[#1a2235] hover:text-[#c9a84c] rounded-lg transition-colors" title="Star">
            <Star size={18} />
          </button>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-[#1a2235] text-slate-400 hover:text-slate-200 rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-semibold text-slate-100 mb-6">{email.data?.subject || '(No Subject)'}</h1>
        
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#c9a84c] text-[#0a0f1e] rounded-full flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(201,168,76,0.3)]">
              {email.data?.from?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-slate-200 text-base">{email.data?.from}</div>
              <div className="text-sm text-slate-500">to me</div>
            </div>
          </div>
          <div className="text-sm text-slate-400 flex items-center gap-3">
            <span>{new Date(email.data?.date).toLocaleString()}</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-[#1a2235] hover:text-slate-200 rounded-md transition-colors"><Reply size={16} /></button>
              <button className="p-1.5 hover:bg-[#1a2235] hover:text-slate-200 rounded-md transition-colors"><CornerUpRight size={16} /></button>
              <button className="p-1.5 hover:bg-[#1a2235] hover:text-slate-200 rounded-md transition-colors"><MoreHorizontal size={16} /></button>
            </div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap text-[15px] leading-relaxed">
          {email.data?.body || 'No content available.'}
        </div>
      </div>

      {/* Quick Reply Box */}
      <div className="p-4 border-t border-[#1e293b] bg-[#0a0f1e]">
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1a2235] border border-[#c9a84c] flex items-center justify-center text-xs font-bold text-slate-300">
            ME
          </div>
          <input 
            type="text" 
            placeholder="Reply to this email..." 
            className="flex-1 bg-transparent border-none text-sm text-slate-200 focus:outline-none focus:ring-0 placeholder-slate-500"
            onClick={() => handleAction('reply started')}
          />
        </div>
      </div>
    </div>
  );
}

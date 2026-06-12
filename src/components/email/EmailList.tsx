'use client';
import { useState, useEffect } from 'react';
import { Star, Clock, Archive, Trash2 } from 'lucide-react';
import { EmailDetail } from './EmailDetail';

export function EmailList({ folder }: { folder: string }) {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'URGENT' | 'IMPORTANT'>('ALL');
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/gmail/list?folder=${folder}`);
        const data = await res.json();
        setEmails(data.emails || []);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  }, [folder]);

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="animate-pulse flex items-center p-4 bg-[#1a2235] rounded-xl gap-4">
            <div className="w-10 h-10 bg-[#1e293b] rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#1e293b] rounded w-1/4"></div>
              <div className="h-3 bg-[#1e293b] rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <div className={`flex flex-col h-full ${selectedEmail ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
        <div className="p-4 border-b border-[#1e293b] flex items-center justify-between sticky top-0 bg-[#0a0f1e]/80 backdrop-blur-md z-10 shrink-0">
        <h2 className="text-xl font-semibold capitalize">{folder}</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-[#1a2235] text-white' : 'hover:bg-[#1a2235] text-slate-400 hover:text-slate-200'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('URGENT')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'URGENT' ? 'bg-[#1a2235] text-white' : 'hover:bg-[#1a2235] text-slate-400 hover:text-slate-200'}`}
          >
            Urgent
          </button>
          <button 
            onClick={() => setFilter('IMPORTANT')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'IMPORTANT' ? 'bg-[#1a2235] text-white' : 'hover:bg-[#1a2235] text-slate-400 hover:text-slate-200'}`}
          >
            Important
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {emails.filter(email => {
          if (filter === 'ALL') return true;
          const isUrgent = email.labelIds?.includes('URGENT');
          const isImportant = email.labelIds?.includes('IMPORTANT');
          if (filter === 'URGENT') return isUrgent;
          if (filter === 'IMPORTANT') return isImportant;
          return true;
        }).map(email => {
          const priority = email.labelIds?.includes('URGENT') ? 'URGENT' : email.labelIds?.includes('IMPORTANT') ? 'IMPORTANT' : 'FYI';
          const isSelected = selectedEmail?.id === email.id;
          return (
            <div 
              key={email.id} 
              onClick={() => setSelectedEmail(email)}
              className={`group flex items-center p-4 border rounded-xl cursor-pointer transition-all gap-4 ${isSelected ? 'bg-[#1a2235] border-[#c9a84c]/50 shadow-[0_0_15px_rgba(201,168,76,0.1)]' : 'bg-[#111827] hover:bg-[#1a2235] border-transparent hover:border-[#1e293b]'}`}
            >
              <div className="w-10 h-10 bg-[#c9a84c] text-[#0a0f1e] rounded-full flex items-center justify-center font-bold shrink-0">
                {email.data?.from?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-100 truncate">{email.data?.from}</span>
                  {priority === 'URGENT' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/20">URGENT</span>}
                  {priority === 'IMPORTANT' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/20">IMPORTANT</span>}
                  <span className="ml-auto text-xs text-slate-500 whitespace-nowrap">
                    {new Date(email.data?.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-200 truncate">{email.data?.subject}</div>
                <div className="text-xs text-slate-500 truncate">{email.data?.body}</div>
              </div>
              <div className="hidden group-hover:flex items-center gap-2 text-slate-400">
                <button onClick={(e) => { e.stopPropagation(); alert('Starred!'); }} className="p-1.5 hover:text-[#c9a84c] rounded-md hover:bg-[#111827] transition-colors"><Star size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); alert('Snoozed!'); }} className="p-1.5 hover:text-[#c9a84c] rounded-md hover:bg-[#111827] transition-colors"><Clock size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); alert('Archived!'); }} className="p-1.5 hover:text-[#c9a84c] rounded-md hover:bg-[#111827] transition-colors"><Archive size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); alert('Moved to Trash!'); }} className="p-1.5 hover:text-red-400 rounded-md hover:bg-[#111827] transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>
      </div>
      {selectedEmail && (
        <EmailDetail email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}
    </div>
  );
}

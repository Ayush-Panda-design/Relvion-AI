'use client';
import { useState, useEffect } from 'react';
import { Search, Mail, Calendar, Settings, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  const actions = [
    { id: 'inbox', title: 'Go to Inbox', icon: Mail, type: 'Navigation', action: () => { router.push('/'); setOpen(false); } },
    { id: 'compose', title: 'Compose new email', icon: Mail, type: 'Action', action: () => { /* Open compose */ setOpen(false); } },
    { id: 'calendar', title: 'Go to Calendar', icon: Calendar, type: 'Navigation', action: () => { router.push('/?folder=calendar'); setOpen(false); } },
    { id: 'settings', title: 'Go to Settings', icon: Settings, type: 'Navigation', action: () => { router.push('/settings'); setOpen(false); } },
  ];

  const filtered = actions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-sm flex justify-center items-start pt-[10vh] px-4">
      <div className="w-full max-w-2xl bg-[#111827] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center px-4 py-3 border-b border-[#1e293b]">
          <Search size={20} className="text-slate-400" />
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 ml-3 text-lg"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-white rounded">
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-6 text-slate-500">No results found.</div>
          ) : (
            filtered.map(action => (
              <button 
                key={action.id} 
                onClick={action.action}
                className="w-full flex items-center px-4 py-3 text-left hover:bg-[#1a2235] rounded-xl transition-colors text-slate-200"
              >
                <action.icon size={18} className="mr-3 text-[#c9a84c]" />
                <span>{action.title}</span>
                <span className="ml-auto text-xs text-slate-500">{action.type}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

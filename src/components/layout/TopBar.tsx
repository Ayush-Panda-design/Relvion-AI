'use client';
import { Search, Bell, Settings, Moon, Sun } from 'lucide-react';
import Link from 'next/link';

export function TopBar() {
  return (
    <header className="h-[60px] border-b border-[#1e293b] flex items-center justify-between px-6 bg-[#0a0f1e] shrink-0">
      <div className="relative w-full max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-500" />
        </div>
        <input 
          type="text" 
          placeholder="Search mail, events, people..." 
          className="block w-full pl-10 pr-10 py-2 border border-[#1e293b] rounded-full bg-[#111827] text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#c9a84c] focus:border-[#c9a84c] transition-all"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-block border border-[#1e293b] rounded-md px-2 py-0.5 text-xs text-slate-500 bg-[#0a0f1e]">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-slate-200 transition-colors">
          <Moon size={20} />
        </button>
        <button className="text-slate-400 hover:text-slate-200 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#ef4444] ring-2 ring-[#0a0f1e]"></span>
        </button>
        <Link href="/settings" className="text-slate-400 hover:text-slate-200 transition-colors">
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}

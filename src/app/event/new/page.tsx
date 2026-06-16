'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewEventPage() {
  const [form, setForm] = useState({ summary: '', description: '', startDateTime: '', endDateTime: '', attendees: '' });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!form.summary || !form.startDateTime || !form.endDateTime) {
      toast.error('Please fill all required fields'); return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/calendar/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Event created!');
      window.location.href = '/dashboard?folder=calendar';
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9C4] text-red-900 flex flex-col">
      <div className="p-6 max-w-xl mx-auto w-full">
        <Link href="/" prefetch={false} className="inline-flex items-center gap-2 text-green-900 hover:text-red-800 mb-6 text-sm">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-2xl font-bold mb-6">New Calendar Event</h1>
        <div className="bg-[#FFF59D] border border-[#FBC02D] rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs text-green-900 mb-1 block">Title *</label>
            <input className="w-full bg-[#FFEE58] border border-[#FBC02D] rounded-xl px-3 py-2 text-sm text-red-800 focus:outline-none focus:ring-1 focus:ring-[#D32F2F]"
              placeholder="Meeting title" value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-green-900 mb-1 block">Start *</label>
              <input type="datetime-local" className="w-full bg-[#FFEE58] border border-[#FBC02D] rounded-xl px-3 py-2 text-sm text-red-800 focus:outline-none focus:ring-1 focus:ring-[#D32F2F]"
                value={form.startDateTime} onChange={e => setForm(f => ({ ...f, startDateTime: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-green-900 mb-1 block">End *</label>
              <input type="datetime-local" className="w-full bg-[#FFEE58] border border-[#FBC02D] rounded-xl px-3 py-2 text-sm text-red-800 focus:outline-none focus:ring-1 focus:ring-[#D32F2F]"
                value={form.endDateTime} onChange={e => setForm(f => ({ ...f, endDateTime: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-green-900 mb-1 block">Attendees (comma-separated emails)</label>
            <input className="w-full bg-[#FFEE58] border border-[#FBC02D] rounded-xl px-3 py-2 text-sm text-red-800 focus:outline-none focus:ring-1 focus:ring-[#D32F2F]"
              placeholder="friend@corsair.dev, colleague@example.com"
              value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-green-900 mb-1 block">Description</label>
            <textarea className="w-full bg-[#FFEE58] border border-[#FBC02D] rounded-xl px-3 py-2 text-sm text-red-800 focus:outline-none focus:ring-1 focus:ring-[#D32F2F] resize-none"
              rows={3} placeholder="Optional" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <button onClick={handleCreate} disabled={creating}
            className="w-full bg-[#D32F2F] hover:bg-[#C62828] text-[#FFF9C4] font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50">
            {creating ? 'Creating…' : 'Create Event & Send Invites'}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface CalEvent {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: { email: string }[];
  description?: string;
}

export function CalendarView() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [today] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Create form state
  const [form, setForm] = useState({
    summary: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    attendees: '',
  });
  const [creating, setCreating] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar/list');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const createEvent = async () => {
    if (!form.summary || !form.startDateTime || !form.endDateTime) {
      toast.error('Please fill in title, start and end time');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/calendar/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Event created! Invite emails sent.' + (form.attendees ? '' : ''));
      setShowCreate(false);
      setForm({ summary: '', description: '', startDateTime: '', endDateTime: '', attendees: '' });
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  // Calendar grid helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const ds = e.start?.dateTime || e.start?.date;
      if (!ds) return false;
      const d = new Date(ds);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Calendar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#0a0f1e] shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-1.5 hover:bg-[#1a2235] rounded-lg text-slate-400">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-bold text-slate-100">{monthName}</h2>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-1.5 hover:bg-[#1a2235] rounded-lg text-slate-400">
              <ChevronRight size={18} />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 border border-[#1e293b] rounded-lg">
              Today
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchEvents} className="p-1.5 hover:bg-[#1a2235] rounded-lg text-slate-400" title="Refresh">
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b55c] text-[#0a0f1e] font-semibold py-2 px-4 rounded-xl text-sm transition-all"
            >
              <Plus size={16} /> New Event
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#1e293b] bg-[#0a0f1e] shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 min-h-full">
            {/* Empty cells before month start */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="border-r border-b border-[#1e293b] bg-[#080d1b] min-h-[100px]" />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              return (
                <div
                  key={day}
                  className={`border-r border-b border-[#1e293b] min-h-[100px] p-1.5 cursor-pointer hover:bg-[#1a2235] transition-colors ${
                    isToday ? 'bg-[#1a2235]' : ''
                  }`}
                  onClick={() => {
                    const pad = (n: number) => String(n).padStart(2, '0');
                    const ds = `${year}-${pad(month+1)}-${pad(day)}T09:00`;
                    const de = `${year}-${pad(month+1)}-${pad(day)}T10:00`;
                    setForm(f => ({ ...f, startDateTime: ds, endDateTime: de }));
                    setShowCreate(true);
                  }}
                >
                  <div className={`text-sm font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-[#c9a84c] text-[#0a0f1e]' : 'text-slate-400'
                  }`}>
                    {day}
                  </div>
                  {dayEvents.slice(0, 3).map(e => (
                    <div key={e.id} className="text-xs bg-[#c9a84c]/20 text-[#c9a84c] rounded px-1 py-0.5 mb-0.5 truncate">
                      {e.summary || '(no title)'}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-slate-600">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Events Sidebar */}
      <div className="w-72 border-l border-[#1e293b] bg-[#0d1425] flex flex-col overflow-hidden shrink-0">
        <div className="px-4 py-3 border-b border-[#1e293b] font-semibold text-slate-200 text-sm">
          Upcoming Events
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-[#1a2235] rounded-xl" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center text-slate-500 text-sm pt-8">No upcoming events</div>
          ) : (
            events.map(e => {
              const startStr = e.start?.dateTime || e.start?.date;
              const start = startStr ? new Date(startStr) : null;
              return (
                <div key={e.id} className="bg-[#1a2235] border border-[#1e293b] rounded-xl p-3">
                  <div className="font-semibold text-slate-200 text-sm truncate">{e.summary || '(no title)'}</div>
                  {start && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                      <Clock size={12} />
                      {start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} {' '}
                      {e.start?.dateTime ? start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'All day'}
                    </div>
                  )}
                  {e.attendees && e.attendees.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <Users size={12} />
                      {e.attendees.length} attendee{e.attendees.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-[#0d1425] border border-[#1e293b] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
              <h3 className="font-bold text-slate-100">New Event</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Title *</label>
                <input
                  className="w-full bg-[#1a2235] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                  placeholder="Meeting title"
                  value={form.summary}
                  onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Start *</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-[#1a2235] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                    value={form.startDateTime}
                    onChange={e => setForm(f => ({ ...f, startDateTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">End *</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-[#1a2235] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                    value={form.endDateTime}
                    onChange={e => setForm(f => ({ ...f, endDateTime: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Attendees (comma-separated emails)</label>
                <input
                  className="w-full bg-[#1a2235] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                  placeholder="friend@corsair.dev, colleague@example.com"
                  value={form.attendees}
                  onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))}
                />
                <p className="text-xs text-slate-600 mt-1">Invite emails will be sent via Gmail</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Description</label>
                <textarea
                  className="w-full bg-[#1a2235] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#c9a84c] resize-none"
                  rows={2}
                  placeholder="Optional details..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <button
                onClick={createEvent}
                disabled={creating}
                className="w-full bg-[#c9a84c] hover:bg-[#d4b55c] text-[#0a0f1e] font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create Event & Send Invites'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

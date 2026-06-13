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
      if (!res.ok) throw new Error('Calendar fetch failed');
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      toast.error('Failed to load calendar events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // SSE subscription — auto-refresh when calendar events change
  useEffect(() => {
    const es = new EventSource('/api/events');
    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'CALENDAR_UPDATED') {
          fetchEvents();
        }
      } catch {}
    };
    return () => es.close();
  }, []);

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
      if (!res.ok) throw new Error(data.error || 'Failed to create event');
      toast.success(
        form.attendees
          ? 'Event created! Invite emails sent.'
          : 'Event created!'
      );
      setShowCreate(false);
      setForm({ summary: '', description: '', startDateTime: '', endDateTime: '', attendees: '' });
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getEventsForDay = (day: number) =>
    events.filter(e => {
      const ds = e.start?.dateTime || e.start?.date;
      if (!ds) return false;
      const d = new Date(ds);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Calendar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#FBC02D] bg-[#FFF9C4] shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentMonth(new Date(year, month - 1))}
              className="p-1.5 hover:bg-[#FFEE58] rounded-lg text-green-900"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-bold text-red-900">{monthName}</h2>
            <button
              onClick={() => setCurrentMonth(new Date(year, month + 1))}
              className="p-1.5 hover:bg-[#FFEE58] rounded-lg text-green-900"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-2 py-1 text-xs text-green-900 hover:text-red-800 border border-[#FBC02D] rounded-lg"
            >
              Today
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchEvents}
              className="p-1.5 hover:bg-[#FFEE58] rounded-lg text-green-900"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#C62828] text-[#FFF9C4] font-semibold py-2 px-4 rounded-xl text-sm transition-all"
            >
              <Plus size={16} /> New Event
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#FBC02D] bg-[#FFF9C4] shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-green-800 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 min-h-full">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="border-r border-b border-[#FBC02D] bg-[#FFFDE7] min-h-[100px]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day;
              return (
                <div
                  key={day}
                  className={`border-r border-b border-[#FBC02D] min-h-[100px] p-1.5 cursor-pointer hover:bg-[#FFEE58] transition-colors ${
                    isToday ? 'bg-[#FFEE58]' : ''
                  }`}
                  onClick={() => {
                    const pad = (n: number) => String(n).padStart(2, '0');
                    const ds = `${year}-${pad(month + 1)}-${pad(day)}T09:00`;
                    const de = `${year}-${pad(month + 1)}-${pad(day)}T10:00`;
                    setForm(f => ({ ...f, startDateTime: ds, endDateTime: de }));
                    setShowCreate(true);
                  }}
                >
                  <div
                    className={`text-sm font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-[#D32F2F] text-[#FFF9C4]' : 'text-green-900'
                    }`}
                  >
                    {day}
                  </div>
                  {dayEvents.slice(0, 3).map(e => (
                    <div
                      key={e.id}
                      className="text-xs bg-[#D32F2F]/20 text-[#D32F2F] rounded px-1 py-0.5 mb-0.5 truncate"
                    >
                      {e.summary || '(no title)'}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-green-700">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Events Sidebar */}
      <div className="w-72 border-l border-[#FBC02D] bg-[#FFF59D] flex flex-col overflow-hidden shrink-0">
        <div className="px-4 py-3 border-b border-[#FBC02D] font-semibold text-red-800 text-sm">
          Upcoming Events
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-[#FFEE58] rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center text-green-800 text-sm pt-8">
              No upcoming events
            </div>
          ) : (
            events.map(e => {
              const startStr = e.start?.dateTime || e.start?.date;
              const start = startStr ? new Date(startStr) : null;
              return (
                <div key={e.id} className="bg-[#FFEE58] border border-[#FBC02D] rounded-xl p-3">
                  <div className="font-semibold text-red-800 text-sm truncate">
                    {e.summary || '(no title)'}
                  </div>
                  {start && (
                    <div className="flex items-center gap-1 text-xs text-green-900 mt-1">
                      <Clock size={12} />
                      {start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{' '}
                      {e.start?.dateTime
                        ? start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                        : 'All day'}
                    </div>
                  )}
                  {e.attendees && e.attendees.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-800 mt-1">
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
        <div className="fixed inset-0 z-50 bg-[#FFF9C4]/80 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-[#FFF59D] border border-[#FBC02D] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#FBC02D]">
              <h3 className="font-bold text-red-900">New Event</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="text-green-900 hover:text-red-800 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-green-900 mb-1 block">Title *</label>
                <input
                  className="w-full bg-[#FFEE58] border border-[#FBC02D] rounded-xl px-3 py-2 text-sm text-red-800 focus:outline-none focus:ring-1 focus:ring-[#D32F2F]"
                  placeholder="Meeting title"
                  value={form.summary}
                  onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-green-900 mb-1 block">Start *</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-[#FFEE58] border border-[#FBC02D] rounded-xl px-3 py-2 text-sm text-red-800 focus:outline-none focus:ring-1 focus:ring-[#D32F2F]"
                    value={form.startDateTime}
                    onChange={e => setForm(f => ({ ...f, startDateTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-green-900 mb-1 block">End *</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-[#FFEE58] border border-[#FBC02D] rounded-xl px-3 py-2 text-sm text-red-800 focus:outline-none focus:ring-1 focus:ring-[#D32F2F]"
                    value={form.endDateTime}
                    onChange={e => setForm(f => ({ ...f, endDateTime: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-green-900 mb-1 block">
                  Attendees (comma-separated emails)
                </label>
                <input
                  className="w-full bg-[#FFEE58] border border-[#FBC02D] rounded-xl px-3 py-2 text-sm text-red-800 focus:outline-none focus:ring-1 focus:ring-[#D32F2F]"
                  placeholder="friend@example.com, colleague@example.com"
                  value={form.attendees}
                  onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))}
                />
                <p className="text-xs text-green-700 mt-1">Invite emails sent via Gmail</p>
              </div>
              <div>
                <label className="text-xs text-green-900 mb-1 block">Description</label>
                <textarea
                  className="w-full bg-[#FFEE58] border border-[#FBC02D] rounded-xl px-3 py-2 text-sm text-red-800 focus:outline-none focus:ring-1 focus:ring-[#D32F2F] resize-none"
                  rows={2}
                  placeholder="Optional details…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <button
                onClick={createEvent}
                disabled={creating}
                className="w-full bg-[#D32F2F] hover:bg-[#C62828] text-[#FFF9C4] font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50"
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

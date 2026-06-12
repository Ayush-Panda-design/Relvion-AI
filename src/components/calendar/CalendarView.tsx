'use client';
import { useState, useEffect } from 'react';

export function CalendarView() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/calendar/list');
        const data = await res.json();
        setEvents(data.events || []);
      } catch (e) {
        console.error('Failed to fetch calendar events', e);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Calendar</h2>
      <div className="grid grid-cols-7 gap-4">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="font-semibold text-center text-slate-400 text-sm pb-2 border-b border-[#1e293b]">
            {day}
          </div>
        ))}
        {Array.from({length: 35}).map((_, i) => {
          // A very simple mock calendar logic just for the hackathon UI grid:
          // We'll just map events randomly to days if we don't build a full calendar engine,
          // OR better: we match event dates to the 1-31 day numbers.
          const dayNum = i + 1 > 31 ? i - 30 : i + 1;
          
          // Find real events that match this day of the month
          const dayEvents = events.filter(e => {
            const eventDateStr = e.start?.dateTime || e.start?.date;
            if (!eventDateStr) return false;
            const eventDay = new Date(eventDateStr).getDate();
            return eventDay === dayNum;
          });

          return (
            <div key={i} className="aspect-square border border-[#1e293b] rounded-xl p-2 hover:bg-[#1a2235] transition-colors cursor-pointer overflow-hidden">
              <span className="text-sm text-slate-500">{dayNum}</span>
              {loading && i === 0 && <div className="text-xs mt-2 text-slate-500">Loading...</div>}
              {dayEvents.map((e, idx) => (
                <div key={e.id || idx} className="mt-1 text-[10px] bg-[#3b82f6]/20 text-[#3b82f6] px-1.5 py-0.5 rounded truncate border border-[#3b82f6]/30">
                  {e.summary || 'Busy'}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

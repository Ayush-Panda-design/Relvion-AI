'use client';
import { CalendarView } from '@/components/calendar/CalendarView';

export default function CalendarPage() {
  return (
    <div className="h-screen w-full bg-[#0a0f1e] overflow-hidden text-slate-100">
      <CalendarView />
    </div>
  );
}

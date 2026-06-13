'use client';
import { CalendarView } from '@/components/calendar/CalendarView';

export default function CalendarPage() {
  return (
    <div className="h-screen w-full bg-[#FFF9C4] overflow-hidden text-red-900">
      <CalendarView />
    </div>
  );
}

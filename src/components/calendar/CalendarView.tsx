'use client';

export function CalendarView() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Calendar</h2>
      <div className="grid grid-cols-7 gap-4">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="font-semibold text-center text-slate-400 text-sm pb-2 border-b border-[#1e293b]">
            {day}
          </div>
        ))}
        {Array.from({length: 35}).map((_, i) => (
          <div key={i} className="aspect-square border border-[#1e293b] rounded-xl p-2 hover:bg-[#1a2235] transition-colors cursor-pointer">
            <span className="text-sm text-slate-500">{i + 1 > 31 ? i - 30 : i + 1}</span>
            {i === 15 && (
              <div className="mt-2 text-xs bg-[#3b82f6]/20 text-[#3b82f6] px-2 py-1 rounded truncate border border-[#3b82f6]/30">
                Team Standup
              </div>
            )}
            {i === 18 && (
              <div className="mt-2 text-xs bg-[#c9a84c]/20 text-[#c9a84c] px-2 py-1 rounded truncate border border-[#c9a84c]/30">
                Design Review
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

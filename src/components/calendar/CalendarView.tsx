'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  RefreshCw,
  Pencil,
  Trash2,
  CalendarDays,
  X,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { CalendarEventsLoader } from '@/components/dashboard/loading/DashboardLoaders';
import { DashboardIllustration } from '@/components/illustrations/DashboardIllustration';
import { ContentProgress } from '@/components/ui/ContentProgress';
import { useCalendarEvents, type CalEvent } from '@/hooks/useCalendarEvents';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const EVENT_PALETTE = [
  { pill: 'bg-[#0D9488]/15 text-[#0D9488] dark:bg-[#8ab4f8]/20 dark:text-[#8ab4f8]', bar: 'bg-[#0D9488] dark:bg-[#8ab4f8]', card: 'border-l-[#0D9488] dark:border-l-[#8ab4f8]' },
  { pill: 'bg-[#f28b82]/20 text-[#f28b82]', bar: 'bg-[#f28b82]', card: 'border-l-[#f28b82]' },
  { pill: 'bg-[#81c995]/20 text-[#81c995]', bar: 'bg-[#81c995]', card: 'border-l-[#81c995]' },
  { pill: 'bg-[#fdd663]/20 text-[#fdd663]', bar: 'bg-[#fdd663]', card: 'border-l-[#fdd663]' },
  { pill: 'bg-[#c58af9]/20 text-[#c58af9]', bar: 'bg-[#c58af9]', card: 'border-l-[#c58af9]' },
  { pill: 'bg-[#78d9ec]/20 text-[#78d9ec]', bar: 'bg-[#78d9ec]', card: 'border-l-[#78d9ec]' },
] as const;

function eventPalette(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % EVENT_PALETTE.length;
  return EVENT_PALETTE[hash];
}

function parseEventStart(e: CalEvent): Date | null {
  const ds = e.start?.dateTime || e.start?.date;
  return ds ? new Date(ds) : null;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toLocalInput(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatEventTime(e: CalEvent, start: Date) {
  if (!e.start?.dateTime) return 'All day';
  return start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function formatDayLabel(date: Date) {
  const today = new Date();
  if (isSameDay(date, today)) return 'Today';
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (isSameDay(date, tomorrow)) return 'Tomorrow';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

const USER_TZ =
  typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';

const emptyForm = {
  summary: '',
  description: '',
  startDateTime: '',
  endDateTime: '',
  attendees: '',
  allDay: false,
  recurrence: 'none' as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
  timeZone: USER_TZ,
};


function EventModal({
  title,
  icon: Icon,
  onClose,
  onSubmit,
  submitLabel,
  loading,
  extraActions,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  loading?: boolean;
  extraActions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={cn('w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl', dash.elevated, dash.border)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn('flex items-center justify-between border-b px-6 py-4', dash.border)}>
          <h3 className={cn('flex items-center gap-2 font-semibold', dash.text)}>
            {Icon && <Icon size={18} className={dash.accent} />}
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={cn('rounded-lg p-1.5 transition-colors', dash.hover, dash.textMuted)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 p-6">{children}</div>
        <div className={cn('flex gap-2 border-t px-6 py-4', dash.border)}>
          {extraActions}
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className={cn(
              'flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all disabled:opacity-50',
              dash.accentBg
            )}
          >
            {loading ? 'Saving…' : submitLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className={cn('mb-1.5 block text-xs font-medium', dash.textMuted)}>{label}</label>
      {children}
      {hint && <p className={cn('mt-1 text-xs', dash.textSubtle)}>{hint}</p>}
    </div>
  );
}

const inputClass = cn(
  'w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2',
  dash.accentRing,
  dash.input,
  dash.border,
  dash.text
);

export function CalendarView({ onRegisterRefresh }: { onRegisterRefresh?: (fn: () => void) => void }) {
  const { events, loading, refreshing, fetchEvents: refreshEvents } = useCalendarEvents();
  const [showCreate, setShowCreate] = useState(false);
  const [today] = useState(() => new Date());
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());

  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const reloadRef = useRef<() => void>(() => {});
  reloadRef.current = () => refreshEvents({ silent: events.length > 0 });

  useEffect(() => {
    onRegisterRefresh?.(() => reloadRef.current());
  }, [onRegisterRefresh]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const selectedDate = new Date(year, month, selectedDay);

  const getEventsForDay = (day: number) =>
    events.filter((e) => {
      const start = parseEventStart(e);
      if (!start) return false;
      return start.getFullYear() === year && start.getMonth() === month && start.getDate() === day;
    });

  const monthEventCount = useMemo(
    () => events.filter((e) => {
      const start = parseEventStart(e);
      return start && start.getFullYear() === year && start.getMonth() === month;
    }).length,
    [events, year, month]
  );

  const selectedDayEvents = getEventsForDay(selectedDay);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return [...events]
      .filter((e) => {
        const start = parseEventStart(e);
        return start && start >= now;
      })
      .sort((a, b) => (parseEventStart(a)?.getTime() ?? 0) - (parseEventStart(b)?.getTime() ?? 0))
      .slice(0, 12);
  }, [events]);

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
      toast.success(form.attendees ? 'Event created with invites sent' : 'Event created!');
      setShowCreate(false);
      setForm(emptyForm);
      reloadRef.current();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (event: CalEvent) => {
    const startStr = event.start?.dateTime || event.start?.date;
    const endStr = event.end?.dateTime || event.end?.date;
    const allDay = !event.start?.dateTime;
    setEditingEvent(event);
    setForm({
      summary: event.summary || '',
      description: event.description || '',
      startDateTime: allDay ? (startStr || '').slice(0, 10) : toLocalInput(startStr),
      endDateTime: allDay ? (endStr || '').slice(0, 10) : toLocalInput(endStr),
      attendees: (event.attendees || []).map((a) => a.email).join(', '),
      allDay,
      recurrence: 'none',
      timeZone: USER_TZ,
    });
  };

  const updateEvent = async () => {
    if (!editingEvent?.id) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/calendar/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingEvent.id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update event');
      toast.success('Event updated');
      setEditingEvent(null);
      reloadRef.current();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setUpdating(false);
    }
  };

  const deleteEvent = async () => {
    if (!editingEvent?.id) return;
    if (!confirm(`Delete "${editingEvent.summary || 'this event'}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/calendar/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingEvent.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete event');
      toast.success('Event deleted');
      setEditingEvent(null);
      reloadRef.current();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const openCreateForDay = (day: number) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const ds = `${year}-${pad(month + 1)}-${pad(day)}T09:00`;
    const de = `${year}-${pad(month + 1)}-${pad(day)}T10:00`;
    setSelectedDay(day);
    setForm({ ...emptyForm, startDateTime: ds, endDateTime: de, timeZone: USER_TZ });
    setShowCreate(true);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(now.getDate());
  };

  const eventFormFields = (
    <>
      <FormField label="Title *">
        <input
          className={inputClass}
          placeholder="Meeting title"
          value={form.summary}
          onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
        />
      </FormField>
      <label className={cn('flex cursor-pointer items-center gap-2 text-sm', dash.textMuted)}>
        <input
          type="checkbox"
          checked={form.allDay}
          onChange={(e) => setForm((f) => ({ ...f, allDay: e.target.checked }))}
          className="rounded border-gray-400"
        />
        All-day event
      </label>
      <div className="grid grid-cols-2 gap-3">
        <FormField label={form.allDay ? 'Start date *' : 'Start *'}>
          <input
            type={form.allDay ? 'date' : 'datetime-local'}
            className={inputClass}
            value={form.startDateTime}
            onChange={(e) => setForm((f) => ({ ...f, startDateTime: e.target.value }))}
          />
        </FormField>
        <FormField label={form.allDay ? 'End date *' : 'End *'}>
          <input
            type={form.allDay ? 'date' : 'datetime-local'}
            className={inputClass}
            value={form.endDateTime}
            onChange={(e) => setForm((f) => ({ ...f, endDateTime: e.target.value }))}
          />
        </FormField>
      </div>
      <FormField label="Repeat" hint="Creates a recurring series (up to 52 occurrences)">
        <select
          className={inputClass}
          value={form.recurrence}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              recurrence: e.target.value as typeof f.recurrence,
            }))
          }
        >
          <option value="none">Does not repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </FormField>
      <FormField label="Time zone" hint="Uses your browser timezone by default">
        <input
          className={inputClass}
          value={form.timeZone}
          onChange={(e) => setForm((f) => ({ ...f, timeZone: e.target.value }))}
          placeholder={USER_TZ}
        />
      </FormField>
      <FormField label="Attendees" hint="Comma-separated emails — invites sent via Google Calendar">
        <input
          className={inputClass}
          placeholder="colleague@example.com"
          value={form.attendees}
          onChange={(e) => setForm((f) => ({ ...f, attendees: e.target.value }))}
        />
      </FormField>
      <FormField label="Description">
        <textarea
          className={cn(inputClass, 'resize-none')}
          rows={3}
          placeholder="Optional details…"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </FormField>
    </>
  );

  return (
    <div className={cn('relative flex min-h-0 flex-1 overflow-hidden', dash.bg)}>
      <ContentProgress active={refreshing} />

      {/* Main calendar */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div
          className={cn(
            'flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-5 py-3',
            dash.border,
            'bg-[#F5F4F0] dark:bg-[#202124]'
          )}
        >
          <div className="flex items-center gap-2">
            <div className={cn('flex items-center rounded-full p-0.5', 'bg-[#F1F1EF] dark:bg-[#303134]')}>
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(year, month - 1))}
                className={cn('rounded-full p-2 transition-colors', dash.hover, dash.textMuted)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(year, month + 1))}
                className={cn('rounded-full p-2 transition-colors', dash.hover, dash.textMuted)}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div>
              <h2 className={cn('text-xl font-semibold tracking-tight', dash.text)}>
                {monthName}{' '}
                <span className={dash.textMuted}>{year}</span>
              </h2>
              <p className={cn('text-xs', dash.textSubtle)}>
                {monthEventCount} event{monthEventCount !== 1 ? 's' : ''} this month
              </p>
            </div>

            <button
              type="button"
              onClick={goToToday}
              className={cn(
                'ml-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                dash.border,
                dash.textMuted,
                dash.hover
              )}
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => reloadRef.current()}
              className={cn('rounded-full p-2.5 transition-colors', dash.hover, dash.textMuted)}
              title="Refresh"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setShowCreate(true);
              }}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:shadow-md',
                dash.accentBg
              )}
            >
              <Plus size={16} />
              New event
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className={cn('grid shrink-0 grid-cols-7 border-b', dash.border)}>
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className={cn('py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider', dash.textSubtle)}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Month grid */}
        <div className="min-h-0 flex-1 overflow-auto p-3">
          <div className="grid min-h-full grid-cols-7 gap-1.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className={cn('min-h-[108px] rounded-xl', 'bg-[#EBEAE5]/70 dark:bg-[#292a2d]/40')}
              />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday =
                today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              const isSelected = selectedDay === day;

              return (
                <motion.button
                  key={day}
                  type="button"
                  layout
                  onClick={() => setSelectedDay(day)}
                  onDoubleClick={() => openCreateForDay(day)}
                  className={cn(
                    'group relative flex min-h-[108px] flex-col rounded-xl border p-2 text-left transition-all duration-150',
                    isSelected
                      ? 'border-[#0D9488]/50 bg-[#0D9488]/8 ring-1 ring-[#0D9488]/25 dark:border-[#8ab4f8]/60 dark:bg-[#8ab4f8]/10 dark:ring-[#8ab4f8]/30'
                      : cn('border-transparent', dash.hover, 'hover:border-[#D8D5CE] dark:hover:border-[#3c4043]'),
                    isToday && !isSelected && 'bg-[#0D9488]/5 dark:bg-[#8ab4f8]/5'
                  )}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
                        isToday
                          ? 'bg-[#0D9488] font-semibold text-white dark:bg-[#8ab4f8] dark:text-[#202124]'
                          : isSelected
                            ? cn(dash.text, 'font-semibold')
                            : dash.textMuted
                      )}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className={cn('text-[10px] font-medium', dash.textSubtle)}>
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                    {dayEvents.slice(0, 3).map((e) => {
                      const palette = eventPalette(e.id);
                      return (
                        <div
                          key={e.id}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            openEdit(e);
                          }}
                          className={cn(
                            'flex items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-opacity hover:opacity-80',
                            palette.pill
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', palette.bar)} />
                          <span className="truncate">{e.summary || '(no title)'}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className={cn('px-1 text-[10px]', dash.textSubtle)}>
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>

                  <div
                    className={cn(
                      'absolute bottom-1.5 right-1.5 rounded-md p-0.5 opacity-0 transition-opacity group-hover:opacity-100',
                      dash.accentSoftBg
                    )}
                    title="Double-click to add event"
                  >
                    <Plus size={12} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <aside
        className={cn(
          'flex w-[300px] shrink-0 flex-col overflow-hidden border-l',
          dash.border,
          'bg-[#F5F4F0] dark:bg-[#292a2d]'
        )}
      >
        {/* Selected day */}
        <div className={cn('border-b p-4', dash.border)}>
          <div className="mb-3 flex items-center gap-2">
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', dash.accentSoftBg)}>
              <CalendarDays size={18} className={dash.accent} />
            </div>
            <div>
              <p className={cn('text-xs font-medium uppercase tracking-wide', dash.textSubtle)}>
                Selected
              </p>
              <p className={cn('text-sm font-semibold', dash.text)}>{formatDayLabel(selectedDate)}</p>
            </div>
          </div>

          <div className="space-y-2">
            {selectedDayEvents.length === 0 ? (
              <div
                className={cn(
                  'rounded-xl border border-dashed px-3 py-5 text-center text-xs',
                  dash.border,
                  dash.textMuted
                )}
              >
                No events — double-click a day to add one
              </div>
            ) : (
              selectedDayEvents.map((e) => {
                const start = parseEventStart(e);
                const palette = eventPalette(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => openEdit(e)}
                    className={cn(
                      'w-full rounded-xl border-l-[3px] border border-transparent p-3 text-left transition-all',
                      palette.card,
                      dash.elevated,
                      dash.border,
                      'hover:shadow-md dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
                    )}
                  >
                    <p className={cn('truncate text-sm font-medium', dash.text)}>
                      {e.summary || '(no title)'}
                    </p>
                    {start && (
                      <p className={cn('mt-1 flex items-center gap-1 text-xs', dash.textMuted)}>
                        <Clock size={11} />
                        {formatEventTime(e, start)}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <button
            type="button"
            onClick={() => openCreateForDay(selectedDay)}
            className={cn(
              'mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition-colors',
              dash.border,
              dash.textMuted,
              dash.hover
            )}
          >
            <Plus size={14} />
            Add on this day
          </button>
        </div>

        {/* Upcoming */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className={cn('flex items-center gap-2 border-b px-4 py-3', dash.border)}>
            <Sparkles size={14} className={dash.accent} />
            <span className={cn('text-sm font-semibold', dash.text)}>Coming up</span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {loading && events.length === 0 ? (
              <CalendarEventsLoader rows={4} />
            ) : upcomingEvents.length === 0 ? (
              <div className="px-2 py-4">
                <DashboardIllustration variant="calendar" size="sm" />
              </div>
            ) : (
              upcomingEvents.map((e, idx) => {
                const start = parseEventStart(e);
                const palette = eventPalette(e.id);
                return (
                  <motion.button
                    key={e.id}
                    type="button"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => openEdit(e)}
                    className={cn(
                      'w-full rounded-xl border-l-[3px] p-3 text-left transition-all',
                      palette.card,
                      dash.elevated,
                      dash.border,
                      dash.hover
                    )}
                  >
                    <p className={cn('truncate text-sm font-medium', dash.text)}>
                      {e.summary || '(no title)'}
                    </p>
                    {start && (
                      <div className={cn('mt-1.5 flex items-center gap-1 text-xs', dash.textMuted)}>
                        <Clock size={11} />
                        {start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {' · '}
                        {formatEventTime(e, start)}
                      </div>
                    )}
                    {e.attendees && e.attendees.length > 0 && (
                      <div className={cn('mt-1 flex items-center gap-1 text-xs', dash.textSubtle)}>
                        <Users size={11} />
                        {e.attendees.length} guest{e.attendees.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {editingEvent && (
          <EventModal
            title="Edit event"
            icon={Pencil}
            onClose={() => setEditingEvent(null)}
            onSubmit={updateEvent}
            submitLabel={updating ? 'Updating…' : 'Save changes'}
            loading={updating}
            extraActions={
              <button
                type="button"
                onClick={deleteEvent}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                <Trash2 size={14} />
                {deleting ? '…' : 'Delete'}
              </button>
            }
          >
            {eventFormFields}
          </EventModal>
        )}

        {showCreate && (
          <EventModal
            title="New event"
            icon={Plus}
            onClose={() => setShowCreate(false)}
            onSubmit={createEvent}
            submitLabel={creating ? 'Creating…' : 'Create event'}
            loading={creating}
          >
            {eventFormFields}
          </EventModal>
        )}
      </AnimatePresence>
    </div>
  );
}

export type RecurrencePreset = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type CalendarEventInput = {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  attendees?: string;
  timeZone?: string;
  allDay?: boolean;
  recurrence?: RecurrencePreset;
};

const FREQ_MAP: Record<Exclude<RecurrencePreset, 'none'>, string> = {
  daily: 'DAILY',
  weekly: 'WEEKLY',
  monthly: 'MONTHLY',
  yearly: 'YEARLY',
};

export function resolveTimeZone(timeZone?: string): string {
  if (timeZone && timeZone.trim()) return timeZone.trim();
  if (typeof Intl !== 'undefined') {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  }
  return 'UTC';
}

export function buildRecurrenceRules(recurrence?: RecurrencePreset): string[] | undefined {
  if (!recurrence || recurrence === 'none') return undefined;
  return [`RRULE:FREQ=${FREQ_MAP[recurrence]};COUNT=52`];
}

export function buildGoogleEventPayload(input: CalendarEventInput): Record<string, unknown> {
  const timeZone = resolveTimeZone(input.timeZone);
  const event: Record<string, unknown> = {
    summary: input.summary,
    description: input.description || '',
  };

  if (input.allDay) {
    event.start = { date: input.startDateTime.slice(0, 10), timeZone };
    event.end = { date: input.endDateTime.slice(0, 10), timeZone };
  } else {
    event.start = { dateTime: input.startDateTime, timeZone };
    event.end = { dateTime: input.endDateTime, timeZone };
  }

  const recurrence = buildRecurrenceRules(input.recurrence);
  if (recurrence) event.recurrence = recurrence;

  if (input.attendees) {
    const list =
      typeof input.attendees === 'string'
        ? input.attendees
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean)
        : input.attendees;
    if (list.length > 0) {
      event.attendees = list.map((email) => ({ email }));
    }
  }

  return event;
}

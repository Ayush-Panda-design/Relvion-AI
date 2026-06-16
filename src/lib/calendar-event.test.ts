import { describe, it, expect } from 'vitest';
import {
  resolveTimeZone,
  buildRecurrenceRules,
  buildGoogleEventPayload,
} from '@/lib/calendar-event';

describe('calendar-event', () => {
  it('resolveTimeZone prefers explicit value', () => {
    expect(resolveTimeZone('Asia/Kolkata')).toBe('Asia/Kolkata');
  });

  it('buildRecurrenceRules returns RRULE for weekly', () => {
    expect(buildRecurrenceRules('weekly')).toEqual(['RRULE:FREQ=WEEKLY;COUNT=52']);
  });

  it('buildRecurrenceRules returns undefined for none', () => {
    expect(buildRecurrenceRules('none')).toBeUndefined();
  });

  it('buildGoogleEventPayload uses local timezone and timed events', () => {
    const payload = buildGoogleEventPayload({
      summary: 'Standup',
      startDateTime: '2026-06-15T09:00',
      endDateTime: '2026-06-15T09:30',
      timeZone: 'America/New_York',
    });
    expect(payload.summary).toBe('Standup');
    expect(payload.start).toEqual({
      dateTime: '2026-06-15T09:00',
      timeZone: 'America/New_York',
    });
    expect(payload.recurrence).toBeUndefined();
  });

  it('buildGoogleEventPayload supports all-day and recurrence', () => {
    const payload = buildGoogleEventPayload({
      summary: 'Holiday',
      startDateTime: '2026-12-25',
      endDateTime: '2026-12-26',
      allDay: true,
      recurrence: 'yearly',
      timeZone: 'Europe/London',
    });
    expect(payload.start).toEqual({ date: '2026-12-25', timeZone: 'Europe/London' });
    expect(payload.recurrence).toEqual(['RRULE:FREQ=YEARLY;COUNT=52']);
  });
});

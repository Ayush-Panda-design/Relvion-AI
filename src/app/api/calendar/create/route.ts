import { NextResponse } from 'next/server';
import { corsair } from '@/server/corsair';

export async function POST(req: Request) {
  try {
    const { summary, description, startDateTime, endDateTime, attendees } = await req.json();

    if (!summary || !startDateTime || !endDateTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const eventBody: any = {
      summary,
      description: description || '',
      start: { dateTime: startDateTime, timeZone: 'UTC' },
      end: { dateTime: endDateTime, timeZone: 'UTC' },
    };

    if (attendees && attendees.length > 0) {
      eventBody.attendees = attendees
        .split(',')
        .map((e: string) => e.trim())
        .filter(Boolean)
        .map((email: string) => ({ email }));
    }

    const result = await (corsair as any).googlecalendar.api.events.insert({
      calendarId: 'primary',
      ...eventBody,
    });

    // Also send invite emails via Gmail if attendees exist
    if (eventBody.attendees?.length) {
      for (const attendee of eventBody.attendees) {
        const emailBody = [
          'From: me',
          `To: ${attendee.email}`,
          `Subject: Invitation: ${summary}`,
          'Content-Type: text/plain; charset="UTF-8"',
          '',
          `You have been invited to: ${summary}`,
          description ? `\nDetails: ${description}` : '',
          `\nWhen: ${new Date(startDateTime).toLocaleString()} - ${new Date(endDateTime).toLocaleString()} UTC`,
          '\nSee your Google Calendar for more details.',
        ].join('\r\n');

        const encoded = Buffer.from(emailBody)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        await (corsair as any).gmail.api.messages.send({ raw: encoded }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, event: result });
  } catch (error: any) {
    console.error('[calendar/create] error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

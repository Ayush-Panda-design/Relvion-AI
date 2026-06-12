// src/lib/mockData.ts

export const mockEmails = [
  {
    id: 'msg-1',
    threadId: 'thread-1',
    labelIds: ['INBOX'],
    data: {
      subject: 'Welcome to Relvion AI',
      from: 'team@relvion.ai',
      to: 'user@example.com',
      date: new Date().toISOString(),
      body: 'Hi there, welcome to Relvion AI! We are so glad to have you on board.',
    },
  },
  {
    id: 'msg-2',
    threadId: 'thread-2',
    labelIds: ['INBOX', 'URGENT'],
    data: {
      subject: 'URGENT: Project Deadline Tomorrow',
      from: 'manager@example.com',
      to: 'user@example.com',
      date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      body: 'Please ensure all reports are submitted by EOD today.',
    },
  },
  {
    id: 'msg-3',
    threadId: 'thread-3',
    labelIds: ['INBOX', 'IMPORTANT'],
    data: {
      subject: 'Quarterly Review Meeting',
      from: 'hr@example.com',
      to: 'user@example.com',
      date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      body: 'Your quarterly review is scheduled for next Tuesday.',
    },
  },
  {
    id: 'msg-4',
    threadId: 'thread-4',
    labelIds: ['INBOX', 'FYI'],
    data: {
      subject: 'Weekly Newsletter: Tech Trends',
      from: 'newsletter@techdaily.com',
      to: 'user@example.com',
      date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      body: 'Here are the latest trends in technology...',
    },
  },
  {
    id: 'msg-5',
    threadId: 'thread-5',
    labelIds: ['SENT'],
    data: {
      subject: 'Re: Project Updates',
      from: 'user@example.com',
      to: 'client@example.com',
      date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      body: 'I have attached the updated mockups.',
    },
  }
];

export const mockEvents = [
  {
    id: 'evt-1',
    summary: 'Team Standup',
    description: 'Daily sync',
    start: { dateTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString() },
    end: { dateTime: new Date(new Date().setHours(10, 30, 0, 0)).toISOString() },
    attendees: [{ email: 'team@example.com' }]
  },
  {
    id: 'evt-2',
    summary: 'Design Review',
    description: 'Reviewing new Relvion AI mockups',
    start: { dateTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString() },
    end: { dateTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString() },
    attendees: [{ email: 'design@example.com' }]
  }
];

export const mockAnalytics = {
  emailsSent: 142,
  emailsSentChange: 12,
  avgResponseTime: 2.4, // hours
  unreadEmails: 5,
  meetingsThisWeek: 8,
};

export const mockContacts = [
  { name: 'Sarah Manager', email: 'manager@example.com', avatar: 'SM' },
  { name: 'HR Team', email: 'hr@example.com', avatar: 'HR' },
  { name: 'Tech Daily', email: 'newsletter@techdaily.com', avatar: 'TD' },
];

/**
 * Local heuristic fallback triage function.
 * Classifies emails as URGENT, IMPORTANT, or FYI using keyword-based analysis
 * when the Gemini API is rate-limited, hit quota limits, or is unconfigured.
 */
export function localTriage(subject: string, body: string, sender: string): 'URGENT' | 'IMPORTANT' | 'FYI' {
  const content = `${subject} ${body}`.toLowerCase();

  // Urgent Keywords: deadlines, actions, immediate, emergencies
  const urgentKeywords = [
    'urgent',
    'emergency',
    'asap',
    'immediate',
    'action required',
    'action needed',
    'deadline',
    'critical',
    'pay now',
    'overdue',
    'security alert',
    'compromised',
    'unauthorized',
    'important: action required',
    'attention required',
  ];

  if (urgentKeywords.some(keyword => content.includes(keyword))) {
    return 'URGENT';
  }

  // Important Keywords: work-related, meetings, reports, payments, invoices, schedules
  const importantKeywords = [
    'meeting',
    'schedule',
    'invoice',
    'payment',
    'project',
    'review',
    'task',
    'report',
    'update',
    'feedback',
    'proposal',
    'agreement',
    'contract',
    'interview',
    'reminder',
    'discussion',
    'agenda',
    'sync',
    'follow up',
    'status',
  ];

  if (importantKeywords.some(keyword => content.includes(keyword))) {
    return 'IMPORTANT';
  }

  // FYI Keywords/Heuristics: newsletters, digests, notifications, receipts, promo
  // By default, if it doesn't match urgent or important, it's FYI.
  return 'FYI';
}

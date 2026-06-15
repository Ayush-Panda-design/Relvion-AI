export interface Attachment {
  filename: string;
  mimeType: string;
  data: string; // base64 encoded content
  size: number;
}

export function encodeRawEmail(parts: {
  to?: string;
  subject?: string;
  body?: string;
  inReplyTo?: string;
  references?: string;
  attachments?: Attachment[];
}): string {
  const hasAttachments = parts.attachments && parts.attachments.length > 0;

  const headers = [
    'From: me',
    ...(parts.to ? [`To: ${parts.to}`] : []),
    ...(parts.subject ? [`Subject: ${parts.subject}`] : []),
    ...(parts.inReplyTo ? [`In-Reply-To: ${parts.inReplyTo}`] : []),
    ...(parts.references ? [`References: ${parts.references}`] : []),
    'MIME-Version: 1.0',
  ];

  if (!hasAttachments) {
    // Simple text/plain message — preserve original behavior
    const messageParts = [
      ...headers,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      parts.body || '',
    ];

    return toUrlSafeBase64(messageParts.join('\r\n'));
  }

  // Multipart/mixed message with attachments
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const messageParts = [
    ...headers,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    parts.body || '',
  ];

  for (const attachment of parts.attachments!) {
    messageParts.push(
      `--${boundary}`,
      `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      '',
      formatBase64Lines(attachment.data),
    );
  }

  messageParts.push(`--${boundary}--`);

  return toUrlSafeBase64(messageParts.join('\r\n'));
}

/** Wraps base64 data to 76-character lines per MIME spec */
function formatBase64Lines(base64: string): string {
  const lines: string[] = [];
  for (let i = 0; i < base64.length; i += 76) {
    lines.push(base64.slice(i, i + 76));
  }
  return lines.join('\r\n');
}

/** Converts a string to URL-safe base64 (RFC 4648 §5) */
function toUrlSafeBase64(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

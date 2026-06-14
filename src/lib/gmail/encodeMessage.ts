export function encodeRawEmail(parts: {
  to?: string;
  subject?: string;
  body?: string;
  inReplyTo?: string;
  references?: string;
}): string {
  const messageParts = [
    'From: me',
    ...(parts.to ? [`To: ${parts.to}`] : []),
    ...(parts.subject ? [`Subject: ${parts.subject}`] : []),
    ...(parts.inReplyTo ? [`In-Reply-To: ${parts.inReplyTo}`] : []),
    ...(parts.references ? [`References: ${parts.references}`] : []),
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    parts.body || '',
  ];

  return Buffer.from(messageParts.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

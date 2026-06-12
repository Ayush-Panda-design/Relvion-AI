// app/inbox/page.tsx
import { corsair } from '@/server/corsair';

export default async function InboxPage() {
  const emails = await corsair.gmail.db.messages.search({});
  return (
    <div>
      {emails.map(e => (
        <div key={e.id}>{e.data?.subject} — {e.data?.from}</div>
      ))}
    </div>
  );
}
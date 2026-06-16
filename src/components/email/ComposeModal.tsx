'use client';
import { useState, useRef } from 'react';
import { X, Send, Minimize2, Paperclip, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

interface ComposeModalProps {
  onClose: () => void;
  draftId?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ComposeModal({ onClose, draftId: initialDraftId }: ComposeModalProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [draftId, setDraftId] = useState(initialDraftId);
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    if (!to && !subject && !body) {
      toast.error('Add some content before saving a draft');
      return;
    }

    setIsSavingDraft(true);
    try {
      const res = await fetch('/api/gmail/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body, draftId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save draft');
      if (data.draft?.id) setDraftId(data.draft.id);
      toast.success('Draft saved');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSend = async () => {
    if (!to || !subject || !body) {
      toast.error('Please fill in all fields (To, Subject, Body)');
      return;
    }

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('body', body);

      for (const file of attachments) {
        formData.append('attachments', file);
      }

      const res = await fetch('/api/gmail/send', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');

      toast.success('Email sent successfully!');
      onClose();
    } catch (error: any) {
      console.error('Send error:', error);
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className={cn(
        'fixed bottom-0 right-24 z-50 flex w-[520px] flex-col overflow-hidden rounded-t-2xl border shadow-2xl shadow-black/20',
        dash.elevated,
        dash.border
      )}
    >
      <div className={cn('flex items-center justify-between border-b px-4 py-3', dash.surface, dash.border)}>
        <span className={cn('text-sm font-semibold', dash.text)}>New Message</span>
        <div className={cn('flex items-center gap-2', dash.textMuted)}>
          <button type="button" className="rounded-lg p-1 transition-colors hover:text-orange-600">
            <Minimize2 size={16} />
          </button>
          <button type="button" onClick={onClose} className="rounded-lg p-1 transition-colors hover:text-orange-600">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className={cn('flex flex-1 flex-col space-y-0 p-1', dash.bg)}>
        <div className={cn('flex items-center border-b px-3 py-2', dash.border)}>
          <span className={cn('w-14 text-sm', dash.textSubtle)}>To</span>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={cn('flex-1 border-none bg-transparent text-sm focus:outline-none', dash.text)}
            placeholder="recipient@email.com"
          />
        </div>
        <div className={cn('flex items-center border-b px-3 py-2', dash.border)}>
          <span className={cn('w-14 text-sm', dash.textSubtle)}>Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={cn('flex-1 border-none bg-transparent text-sm focus:outline-none', dash.text)}
            placeholder="What's this about?"
          />
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={cn(
            'min-h-[280px] w-full flex-1 resize-none border-none bg-transparent px-3 py-3 text-sm focus:outline-none',
            dash.text
          )}
          placeholder="Write your message…"
        />
      </div>

      {attachments.length > 0 && (
        <div className={cn('flex flex-wrap gap-2 border-t px-4 py-2', dash.surface, dash.border)}>
          {attachments.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-1.5 rounded-full border border-orange-600/20 bg-orange-600/10 px-3 py-1 text-xs text-orange-600"
            >
              <span className="max-w-[140px] truncate font-medium">{file.name}</span>
              <span className="opacity-60">({formatFileSize(file.size)})</span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="ml-0.5 transition-colors hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
        className="hidden"
      />

      <div className={cn('flex items-center justify-between border-t px-4 py-3', dash.surface, dash.border)}>
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSend}
            disabled={isSending}
            className={cn(
              'flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-semibold text-white disabled:opacity-50',
              dash.accentBg
            )}
          >
            {isSending ? <span className="animate-pulse">Sending…</span> : <><Send size={14} /> Send</>}
          </motion.button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50',
              dash.border,
              dash.text,
              dash.hover
            )}
          >
            <Save size={14} />
            {isSavingDraft ? 'Saving…' : 'Draft'}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn('relative rounded-lg p-2 transition-colors', dash.hover, dash.textMuted, 'hover:text-orange-600')}
          >
            <Paperclip size={18} />
            {attachments.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                {attachments.length}
              </span>
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={cn('rounded-lg px-2 py-1.5 text-sm transition-colors', dash.textMuted, 'hover:text-red-500')}
        >
          Discard
        </button>
      </div>
    </motion.div>
  );
}

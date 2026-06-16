'use client';

import { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Minimize2,
  Paperclip,
  Save,
  Mail,
  User,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import { BorderBeam } from '@/components/ui/border-beam';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { TemplatePicker } from './TemplatePicker';

interface ComposeModalProps {
  onClose: () => void;
  draftId?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FieldRow({
  label,
  icon: Icon,
  children,
  delay = 0,
}: {
  label: string;
  icon: typeof Mail;
  children: React.ReactNode;
  delay?: number;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.25 }}
      className={cn('group relative flex items-center gap-3 border-b px-4 py-2.5', dash.border)}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
          focused ? dash.accentSelected : cn(dash.chip)
        )}
      >
        <Icon size={15} strokeWidth={1.75} />
      </div>
      <span className={cn('w-12 shrink-0 text-xs font-medium uppercase tracking-wide', dash.textSubtle)}>
        {label}
      </span>
      <div
        className="min-w-0 flex-1"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {children}
      </div>
      <motion.div
        className="absolute bottom-0 left-14 right-4 h-0.5 origin-left rounded-full bg-[#0D9488] dark:bg-[#8ab4f8]"
        initial={false}
        animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}

export function ComposeModal({ onClose, draftId: initialDraftId }: ComposeModalProps) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [draftId, setDraftId] = useState(initialDraftId);
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [minimized, setMinimized] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredRef = useRef(false);

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const previewLabel = subject || to || 'New message';

  useEffect(() => {
    fetch('/api/gmail/draft/autosave')
      .then((r) => r.json())
      .then((data) => {
        const d = data.draft;
        if (!d || restoredRef.current) return;
        restoredRef.current = true;
        if (d.to) setTo(d.to);
        if (d.cc) {
          setCc(d.cc);
          setShowCcBcc(true);
        }
        if (d.bcc) {
          setBcc(d.bcc);
          setShowCcBcc(true);
        }
        if (d.subject) setSubject(d.subject);
        if (d.body) setBody(d.body);
        if (d.gmailDraftId) setDraftId(d.gmailDraftId);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!to && !subject && !body) return;

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      setAutosaveStatus('saving');
      fetch('/api/gmail/draft/autosave', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, cc, bcc, subject, body, gmailDraftId: draftId }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then(() => setAutosaveStatus('saved'))
        .catch(() => setAutosaveStatus('idle'));
    }, 3000);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [to, cc, bcc, subject, body, draftId]);

  const clearAutosave = () => {
    fetch('/api/gmail/draft/autosave', { method: 'DELETE' }).catch(() => {});
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
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
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save draft');
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
      if (cc) formData.append('cc', cc);
      if (bcc) formData.append('bcc', bcc);
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
      clearAutosave();
      onClose();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to send');
    } finally {
      setIsSending(false);
    }
  };

  if (minimized) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        onClick={() => setMinimized(false)}
        className={cn(
          'fixed bottom-4 right-6 z-50 flex max-w-xs items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl transition-shadow hover:shadow-[0_8px_30px_rgba(138,180,248,0.25)]',
          dash.elevated,
          dash.border
        )}
      >
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', dash.accentSelected)}>
          <Mail size={16} />
        </span>
        <span className={cn('truncate text-sm font-medium', dash.text)}>{previewLabel}</span>
        <ChevronUp size={16} className={cn('shrink-0', dash.textMuted)} />
      </motion.button>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[3px] dark:bg-black/45"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className={cn(
          'fixed bottom-0 right-6 z-50 flex w-[min(560px,calc(100vw-2rem))] flex-col overflow-hidden rounded-t-2xl border shadow-[0_-8px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.55)]',
          dash.elevated,
          dash.border
        )}
      >
        <BorderBeam size={180} duration={10} colorFrom="#8ab4f8" colorTo="#669df6" borderWidth={1.5} />

        {/* Header */}
        <div className="relative overflow-hidden border-b border-[#0D9488]/15 bg-gradient-to-r from-[#0D9488]/8 via-transparent to-[#059669]/8 dark:border-[#8ab4f8]/20 dark:from-[#8ab4f8]/15 dark:to-[#394457]/40">
          <div className="absolute inset-0 opacity-30">
            <AnimatedGridPattern numSquares={24} maxOpacity={0.08} className="text-[#0D9488] dark:text-[#8ab4f8]" />
          </div>
          <div className="relative flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.8, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className={cn('flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-[#0D9488]/20 dark:ring-[#8ab4f8]/30', dash.accentSelected)}
              >
                <Mail size={18} strokeWidth={1.75} />
              </motion.div>
              <div>
                <h2 className={cn('flex items-center gap-1.5 text-sm font-semibold', dash.text)}>
                  New message
                  <Sparkles size={13} className={dash.accent} />
                </h2>
                <p className={cn('text-[11px]', dash.textSubtle)}>
                  Powered by Gmail via Corsair
                  {autosaveStatus === 'saving' && ' · Saving…'}
                  {autosaveStatus === 'saved' && ' · Draft saved'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMinimized(true)}
                className={cn('rounded-lg p-2 transition-colors', dash.hover, dash.textMuted, dash.accentHover)}
                title="Minimize"
              >
                <Minimize2 size={16} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className={cn('rounded-lg p-2 transition-colors', dash.hover, dash.textMuted, 'hover:text-red-400')}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className={cn('relative flex flex-1 flex-col', dash.bg)}>
          <FieldRow label="To" icon={User} delay={0.05}>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={cn('w-full border-none bg-transparent text-sm focus:outline-none', dash.text)}
              placeholder="recipient@email.com"
            />
          </FieldRow>

          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            onClick={() => setShowCcBcc((v) => !v)}
            className={cn(
              'flex items-center gap-1 border-b px-4 py-1.5 text-[11px] font-medium transition-colors',
              dash.border,
              dash.textMuted,
              dash.accentHover
            )}
          >
            {showCcBcc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showCcBcc ? 'Hide Cc / Bcc' : 'Cc / Bcc'}
          </motion.button>

          <AnimatePresence>
            {showCcBcc && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <FieldRow label="Cc" icon={User} delay={0}>
                  <input
                    type="email"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    className={cn('w-full border-none bg-transparent text-sm focus:outline-none', dash.text)}
                    placeholder="Optional"
                  />
                </FieldRow>
                <FieldRow label="Bcc" icon={User} delay={0}>
                  <input
                    type="email"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    className={cn('w-full border-none bg-transparent text-sm focus:outline-none', dash.text)}
                    placeholder="Optional"
                  />
                </FieldRow>
              </motion.div>
            )}
          </AnimatePresence>

          <FieldRow label="Subject" icon={FileText} delay={0.12}>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={cn('w-full border-none bg-transparent text-sm focus:outline-none', dash.text)}
              placeholder="What's this about?"
            />
          </FieldRow>

          {/* Body */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="relative min-h-[260px] flex-1"
          >
            <AnimatedGridPattern numSquares={30} maxOpacity={0.06} className="text-[#0D9488]/40 dark:text-[#8ab4f8]/40" />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={cn(
                'relative z-10 min-h-[260px] w-full resize-none border-none bg-transparent px-4 py-4 text-sm leading-relaxed focus:outline-none',
                dash.text
              )}
              placeholder="Write your message…"
            />
            <div className={cn('absolute bottom-2 right-4 z-10 text-[10px] tabular-nums', dash.textSubtle)}>
              {wordCount > 0 && `${wordCount} word${wordCount === 1 ? '' : 's'}`}
            </div>
          </motion.div>
        </div>

        {/* Attachments */}
        <LayoutGroup>
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn('overflow-hidden border-t px-4 py-3', dash.surface, dash.border)}
              >
                <p className={cn('mb-2 text-[10px] font-semibold uppercase tracking-wider', dash.textSubtle)}>
                  Attachments
                </p>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <motion.div
                      key={`${file.name}-${index}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={cn('flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs', dash.accentSoftBg, 'border-[#0D9488]/20 dark:border-[#8ab4f8]/25')}
                    >
                      {file.type.startsWith('image/') ? (
                        <ImageIcon size={13} />
                      ) : (
                        <Paperclip size={13} />
                      )}
                      <span className="max-w-[120px] truncate font-medium">{file.name}</span>
                      <span className="opacity-60">{formatFileSize(file.size)}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-red-500/20 hover:text-red-400"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
          className="hidden"
        />

        {/* Footer */}
        <div
          className={cn(
            'flex items-center justify-between border-t px-4 py-3',
            dash.surface,
            dash.border,
            'bg-gradient-to-t from-[#0D9488]/5 to-transparent dark:from-[#8ab4f8]/10'
          )}
        >
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSend}
              disabled={isSending}
              className={cn(
                'relative flex items-center gap-2 overflow-hidden rounded-xl px-6 py-2.5 text-sm font-semibold shadow-lg shadow-[#0D9488]/15 disabled:opacity-50 dark:shadow-[#8ab4f8]/20',
                dash.accentBg
              )}
            >
              {isSending ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent"
                  />
                  Sending…
                </span>
              ) : (
                <>
                  <Send size={14} />
                  Send
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50',
                dash.border,
                dash.text,
                dash.hover
              )}
            >
              <Save size={14} className={dash.accent} />
              {isSavingDraft ? 'Saving…' : 'Gmail draft'}
            </motion.button>

            <TemplatePicker
              onSelect={(t) => {
                if (t.subject && !subject) setSubject(t.subject);
                if (t.body) setBody((prev) => (prev ? `${prev}\n\n${t.body}` : t.body || ''));
              }}
            />

            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative rounded-xl p-2.5 transition-colors',
                dash.hover,
                dash.textMuted,
                dash.accentHover
              )}
              title="Attach files"
            >
              <Paperclip size={18} />
              {attachments.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn('absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white', dash.accentBg)}
                >
                  {attachments.length}
                </motion.span>
              )}
            </motion.button>
          </div>

          <button
            type="button"
            onClick={() => {
              clearAutosave();
              onClose();
            }}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm transition-colors',
              dash.textMuted,
              'hover:bg-red-500/10 hover:text-red-400'
            )}
          >
            Discard
          </button>
        </div>
      </motion.div>
    </>
  );
}

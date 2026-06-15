'use client';
import { useState, useRef } from 'react';
import { X, Send, Minimize2, Paperclip, Save } from 'lucide-react';
import toast from 'react-hot-toast';

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
    <div className="fixed bottom-0 right-24 w-[500px] bg-[#FFF59D] border border-[#FBC02D] rounded-t-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-[#FFEE58] px-4 py-3 flex items-center justify-between border-b border-[#FBC02D]">
        <span className="text-sm font-semibold text-red-800">New Message</span>
        <div className="flex items-center gap-2 text-green-900">
          <button className="hover:text-red-800 transition-colors">
            <Minimize2 size={16} />
          </button>
          <button onClick={onClose} className="hover:text-red-800 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="flex flex-col flex-1 p-2 space-y-2 bg-[#FFF59D]">
        <div className="flex items-center border-b border-[#FBC02D] px-2 py-1">
          <span className="text-sm text-green-900 w-12">To:</span>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm text-red-800 focus:outline-none focus:ring-0 placeholder-slate-600"
            placeholder="friend@corsair.dev"
          />
        </div>
        <div className="flex items-center border-b border-[#FBC02D] px-2 py-1">
          <span className="text-sm text-green-900 w-12">Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm text-red-800 focus:outline-none focus:ring-0 placeholder-slate-600"
            placeholder="Let's catch up!"
          />
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 min-h-[300px] w-full bg-transparent border-none text-sm text-red-800 focus:outline-none focus:ring-0 placeholder-slate-600 resize-none px-2 py-2"
          placeholder="Write your message here..."
        />
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-[#FFF9C4] border-t border-[#FBC02D] flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-1.5 bg-[#FFEE58] border border-[#FBC02D] text-red-800 rounded-full px-3 py-1 text-xs"
            >
              <span className="max-w-[140px] truncate font-medium">{file.name}</span>
              <span className="text-red-800/60">({formatFileSize(file.size)})</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-green-800 hover:text-red-700 transition-colors ml-0.5"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
        className="hidden"
      />

      {/* Footer */}
      <div className="bg-[#FFF9C4] px-4 py-3 border-t border-[#FBC02D] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSend}
            disabled={isSending}
            className="bg-[#D32F2F] hover:bg-[#C62828] text-[#FFF9C4] font-semibold py-1.5 px-6 rounded-lg transition-all flex items-center gap-2 shadow-[0_0_10px_rgba(201,168,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <span className="animate-pulse">Sending...</span>
            ) : (
              <>
                <Send size={14} /> Send
              </>
            )}
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="bg-[#FFEE58] hover:bg-[#FFF176] text-red-800 font-semibold py-1.5 px-4 rounded-lg transition-all flex items-center gap-2 border border-[#FBC02D] disabled:opacity-50"
          >
            <Save size={14} />
            {isSavingDraft ? 'Saving…' : 'Draft'}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative text-green-900 hover:text-red-800 transition-colors p-1.5 rounded-md hover:bg-[#FFEE58]"
          >
            <Paperclip size={18} />
            {attachments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D32F2F] text-[#FFF9C4] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {attachments.length}
              </span>
            )}
          </button>
        </div>
        <button onClick={onClose} className="text-green-800 hover:text-red-700 text-sm transition-colors p-1.5 rounded-md hover:bg-[#FFEE58]">
          Discard
        </button>
      </div>
    </div>
  );
}

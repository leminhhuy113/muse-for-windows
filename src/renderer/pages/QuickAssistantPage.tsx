/* Lucian UX/UI Prompt #451, #452, #456, #457, #458 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/ */
import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  ClipboardPaste,
  FolderOpen,
  Mic,
  Paperclip,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import { useAppStore } from '@renderer/stores/useAppStore';
import { BrandLogo, Button, StatusBadge } from '@renderer/components/ui/Primitives';

const GHOST_SUGGESTIONS = [
  'Summarize my top priorities for today and draft an action plan',
  'Organize files in @workspace and list recent documents',
  'Prepare a structured weekly briefing from my notes',
];

export function QuickAssistantPage({ standalone = false }: { standalone?: boolean }) {
  const { t, settings, setActiveScreen, pushToast } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [targetMode, setTargetMode] = useState<'mode-a' | 'mode-c'>('mode-a');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [mentionMenuOpen, setMentionMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 30);
  }, []);

  const ghostCompletion =
    prompt.length >= 3 && prompt.length < 35
      ? GHOST_SUGGESTIONS.find((s) => s.toLowerCase().startsWith(prompt.toLowerCase()))?.slice(
          prompt.length,
        ) || ''
      : '';

  const handlePasteClipboard = async () => {
    if (!window.museApi) return;
    const clip = await window.museApi.readClipboard();
    if (clip) {
      setPrompt((prev) => (prev ? `${prev}\n\n${clip}` : clip));
      textareaRef.current?.focus();
    }
  };

  const handleAttachToShared = async () => {
    if (!window.museApi) return;
    const importedCount = await window.museApi.importWorkspaceFiles('Shared');
    if (importedCount > 0) {
      const files = await window.museApi.listWorkspaceFiles('Shared');
      setAttachments(files.slice(0, importedCount).map((f) => f.name));
    }
  };

  const handleVoiceToggle = () => {
    const SpeechRec =
      (window as unknown as { webkitSpeechRecognition?: new () => { lang: string; start: () => void; stop: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void } })
        .webkitSpeechRecognition;
    if (!SpeechRec) {
      pushToast({
        title: 'Voice Mode',
        body: 'Redirecting to official Muse workspace for native WebRTC voice.',
        tone: 'info',
      });
      setActiveScreen('muse');
      return;
    }
    if (voiceActive) {
      setVoiceActive(false);
      return;
    }
    const rec = new SpeechRec();
    rec.lang = document.documentElement.lang === 'vi' ? 'vi-VN' : 'en-US';
    setVoiceActive(true);
    rec.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || '';
      if (text) setPrompt((p) => (p ? `${p} ${text}` : text));
    };
    rec.onend = () => setVoiceActive(false);
    rec.start();
  };

  const handleSubmit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setLastResult(null);
    try {
      if (window.museApi) {
        const res = await window.museApi.submitQuickPrompt({
          prompt: trimmed,
          targetMode,
          attachments,
        });
        setLastResult(res.output);
        if (res.mode === 'mode-a') {
          pushToast({
            title: t.quickAssistant.title,
            body: t.quickAssistant.handoffNotice,
            tone: 'success',
          });
          setPrompt('');
        }
      }
    } catch (err) {
      setLastResult(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      if (standalone && window.museApi) {
        void window.museApi.hideQuickAssistant();
      } else {
        setMentionMenuOpen(false);
      }
    } else if (e.key === 'Tab' && ghostCompletion) {
      e.preventDefault();
      setPrompt((p) => p + ghostCompletion);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div
      className={`ux flex flex-col ${
        standalone
          ? 'h-screen w-screen p-4 bg-[var(--ms-surface)] border border-[var(--ms-border)] rounded-xl'
          : 'max-w-3xl mx-auto py-8 px-6'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between gap-3 mb-3 ${standalone ? 'ms-drag-region' : ''}`}>
        <div className="flex items-center gap-2.5">
          <div className="lx-orb" data-active={String(submitting || voiceActive)} aria-hidden="true" />
          <div>
            <div className="text-[14px] font-bold flex items-center gap-2">
              <span>{t.quickAssistant.title}</span>
              <StatusBadge tone={targetMode === 'mode-a' ? 'accent' : 'info'}>
                {targetMode === 'mode-a' ? 'Mode A · Official Muse' : 'Mode C · Local Agent'}
              </StatusBadge>
            </div>
            <div className="text-[11.5px] text-[var(--ms-text-muted)]">{t.quickAssistant.escHint}</div>
          </div>
        </div>

        <div className="ms-no-drag flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setTargetMode((m) =>
                m === 'mode-a' && settings.integrations.modeCEnabled ? 'mode-c' : 'mode-a',
              )
            }
            className="lx-cmdk"
            title="Switch provider target"
          >
            <Sparkles size={13} className="text-[var(--ms-accent-text)]" />
            <span>{targetMode === 'mode-a' ? 'Muse (muse.ai)' : settings.integrations.modeCModel}</span>
          </button>
          {standalone && (
            <button
              type="button"
              aria-label={t.common.close}
              onClick={() => window.museApi?.hideQuickAssistant()}
              className="w-7 h-7 rounded-md flex items-center justify-center bg-transparent border-0 text-[var(--ms-text-muted)] hover:bg-[var(--ms-surface-hover)]"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Lucian #452 Prompt Box + #451 Mention + #456 Ghost Suggestion */}
      <div className="relative rounded-xl bg-[var(--ms-bg)] border border-[var(--ms-border)] focus-within:border-[var(--ms-accent)] p-3.5 transition-colors">
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={standalone ? 3 : 4}
            value={prompt}
            onChange={(e) => {
              const val = e.target.value;
              setPrompt(val);
              setMentionMenuOpen(val.endsWith('@'));
            }}
            onKeyDown={handleKeyDown}
            placeholder={t.quickAssistant.placeholder}
            className="w-full resize-none bg-transparent border-0 outline-none text-[14px] text-[var(--ms-text-primary)] leading-relaxed"
          />
          {ghostCompletion && (
            <div className="text-[12px] text-[var(--ms-text-muted)] mt-1 flex items-center gap-1.5">
              <span>Suggestion: …{ghostCompletion}</span>
              <kbd className="lx-kbd">Tab</kbd>
            </div>
          )}
        </div>

        {/* Mention Picker (#451) */}
        {mentionMenuOpen && (
          <div className="mt-2 p-1.5 rounded-lg bg-[var(--ms-surface-elevated)] border border-[var(--ms-border)] flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPrompt((p) => `${p}workspace `);
                setMentionMenuOpen(false);
                textareaRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded bg-[var(--ms-accent-subtle)] text-[var(--ms-accent-text)] text-[12px] font-bold border-0"
            >
              @workspace (Local Sandbox Context)
            </button>
            <button
              type="button"
              onClick={() => {
                setPrompt((p) => `${p}shared `);
                setMentionMenuOpen(false);
                textareaRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded bg-[var(--ms-surface-hover)] text-[var(--ms-text-primary)] text-[12px] border-0"
            >
              @shared (Staged Files)
            </button>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {attachments.map((file) => (
              <span
                key={file}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--ms-surface-elevated)] border border-[var(--ms-border)] text-[11.5px]"
              >
                <Paperclip size={11} />
                <span>{file}</span>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-[var(--ms-border-subtle)]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePasteClipboard}
              icon={<ClipboardPaste size={14} />}
            >
              {t.quickAssistant.useClipboardBtn}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAttachToShared}
              icon={<Paperclip size={14} />}
            >
              {t.quickAssistant.attachFileBtn}
            </Button>
            <Button
              size="sm"
              variant={voiceActive ? 'primary' : 'ghost'}
              onClick={handleVoiceToggle}
              icon={<Mic size={14} />}
            >
              {voiceActive ? 'Listening…' : 'Voice'}
            </Button>
          </div>

          <Button
            size="sm"
            variant="primary"
            loading={submitting}
            disabled={!prompt.trim()}
            onClick={handleSubmit}
            icon={<ArrowUp size={14} />}
          >
            {targetMode === 'mode-a' ? t.quickAssistant.submitToMuse : t.quickAssistant.runLocalAgent}
          </Button>
        </div>
      </div>

      {/* Quick Local Actions */}
      {!standalone && (
        <div className="mt-6">
          <h3 className="text-[12px] uppercase tracking-wider text-[var(--ms-text-muted)] mb-2.5">
            {t.quickAssistant.recentActions}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setActiveScreen('muse')}
              className="p-3.5 rounded-lg bg-[var(--ms-surface)] border border-[var(--ms-border)] hover:bg-[var(--ms-surface-hover)] text-left flex items-center gap-3"
            >
              <BrandLogo size={22} />
              <div>
                <div className="text-[13px] font-bold">{t.nav.muse}</div>
                <div className="text-[11.5px] text-[var(--ms-text-muted)]">https://muse.ai</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('workspace')}
              className="p-3.5 rounded-lg bg-[var(--ms-surface)] border border-[var(--ms-border)] hover:bg-[var(--ms-surface-hover)] text-left flex items-center gap-3"
            >
              <FolderOpen size={20} className="text-[var(--ms-accent-text)] shrink-0" />
              <div>
                <div className="text-[13px] font-bold">{t.nav.workspace}</div>
                <div className="text-[11.5px] text-[var(--ms-text-muted)]">10 GB Sandboxed</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('permissions')}
              className="p-3.5 rounded-lg bg-[var(--ms-surface)] border border-[var(--ms-border)] hover:bg-[var(--ms-surface-hover)] text-left flex items-center gap-3"
            >
              <ShieldCheck size={20} className="text-[var(--ms-success)] shrink-0" />
              <div>
                <div className="text-[13px] font-bold">{t.nav.permissions}</div>
                <div className="text-[11.5px] text-[var(--ms-text-muted)]">Default-Deny Gate</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {lastResult && (
        <div className="mt-4 p-4 rounded-lg bg-[var(--ms-surface)] border border-[var(--ms-border)] text-[13px] whitespace-pre-wrap overflow-y-auto max-h-56">
          <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[var(--ms-accent-text)] mb-1">
            <Terminal size={13} />
            <span>Execution Output</span>
          </div>
          {lastResult}
        </div>
      )}
    </div>
  );
}

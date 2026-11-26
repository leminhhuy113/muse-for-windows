/* Lucian UX/UI Prompt #416, #451, #456, #458, #472 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/ */
import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Camera,
  Check,
  CheckCircle2,
  ClipboardPaste,
  Clock,
  Copy,
  ExternalLink,
  KeyRound,
  MessageSquarePlus,
  Paperclip,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import type { MuseChatMessage } from '@shared/types';
import { useAppStore } from '@renderer/stores/useAppStore';
import { BrandLogo, Button, StatusBadge } from '@renderer/components/ui/Primitives';

function getFileBaseName(filePath: string): string {
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1] || filePath;
}

/** Safe inline formatter (**bold** and `code`) with zero dangerouslySetInnerHTML */
function renderInlineSegments(line: string): React.ReactNode[] {
  const tokens = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**') && tok.length > 4) {
      return (
        <strong key={i} className="font-semibold text-[var(--ms-text-primary)]">
          {tok.slice(2, -2)}
        </strong>
      );
    }
    if (tok.startsWith('`') && tok.endsWith('`') && tok.length > 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-[var(--ms-bg)] border border-[var(--ms-border)] font-mono text-[12.5px]"
        >
          {tok.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={i}>{tok}</React.Fragment>;
  });
}

function FormattedMessageBody({
  text,
  onCopyCode,
  copyLabel,
}: {
  text: string;
  onCopyCode: (code: string) => void;
  copyLabel: string;
}) {
  const blocks = text.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-2.5 text-[14px] leading-[1.65] break-words">
      {blocks.map((block, idx) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          const rawInner = block.slice(3, -3).replace(/^\n/, '');
          const firstNewline = rawInner.indexOf('\n');
          const hasLang =
            firstNewline > 0 &&
            firstNewline < 18 &&
            /^[a-z0-9_+-]+$/i.test(rawInner.slice(0, firstNewline).trim());
          const lang = hasLang ? rawInner.slice(0, firstNewline).trim() : '';
          const codeBody = hasLang ? rawInner.slice(firstNewline + 1) : rawInner;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] overflow-hidden my-2"
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-[var(--ms-border)] text-[11px] text-[var(--ms-text-muted)]">
                <span className="font-mono uppercase">{lang || 'code'}</span>
                <button
                  type="button"
                  onClick={() => onCopyCode(codeBody)}
                  className="inline-flex items-center gap-1 bg-transparent border-0 p-0 text-[11px] font-semibold text-[var(--ms-accent-text)] hover:underline"
                >
                  <Copy size={11} />
                  <span>{copyLabel}</span>
                </button>
              </div>
              <pre className="m-0 p-3.5 overflow-x-auto font-mono text-[12.5px] leading-relaxed text-[var(--ms-text-primary)]">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        const paragraphs = block
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean);

        return (
          <React.Fragment key={idx}>
            {paragraphs.map((para, pIdx) => {
              const lines = para.split('\n');
              const isBulletList =
                lines.length > 0 && lines.every((l) => /^\s*[-*•]\s+/.test(l));
              if (isBulletList) {
                return (
                  <ul key={pIdx} className="m-0 pl-5 space-y-1 list-disc">
                    {lines.map((l, lIdx) => (
                      <li key={lIdx}>{renderInlineSegments(l.replace(/^\s*[-*•]\s+/, ''))}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={pIdx} className="m-0 whitespace-pre-wrap">
                  {lines.map((line, lIdx) => (
                    <React.Fragment key={lIdx}>
                      {lIdx > 0 && <br />}
                      {renderInlineSegments(line)}
                    </React.Fragment>
                  ))}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function NativeMuseChatPage() {
  const {
    t,
    chatState,
    museState,
    sendMuseMessage,
    startNewMuseChat,
    refreshMuseChat,
    openMuseSignInWindow,
    pushToast,
  } = useAppStore();

  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lastMessageText =
    chatState.messages.length > 0
      ? chatState.messages[chatState.messages.length - 1].text
      : '';

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatState.messages.length, lastMessageText, chatState.streaming]);

  const handleCopy = async (text: string, id?: string) => {
    await window.museApi?.copyText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1600);
    }
    pushToast({ title: t.chat.copiedToast, tone: 'success' });
  };

  const handlePickAttachments = async () => {
    if (!window.museApi) return;
    const files = await window.museApi.musePickChatAttachments();
    if (files.length > 0) {
      setAttachments((prev) => Array.from(new Set([...prev, ...files])).slice(0, 8));
      textareaRef.current?.focus();
    }
  };

  const handleCaptureScreen = async () => {
    if (!window.museApi) return;
    try {
      const res = (await window.museApi.invokeBridgeTool('screen.capture', {
        displayIndex: 0,
      })) as { filePath?: string };
      if (res?.filePath) {
        const capturedPath = res.filePath;
        setAttachments((prev) => Array.from(new Set([...prev, capturedPath])).slice(0, 8));
        pushToast({ title: t.companion.captureDone, body: capturedPath, tone: 'success' });
      }
    } catch (err) {
      pushToast({
        title: t.computerUse.captureBlockedTitle,
        body: err instanceof Error ? err.message : String(err),
        tone: 'warning',
      });
    }
  };

  const handlePasteClipboard = async () => {
    if (!window.museApi) return;
    const clip = await window.museApi.readClipboard();
    if (clip) {
      setDraft((prev) => (prev ? `${prev}\n${clip}` : clip));
      textareaRef.current?.focus();
    }
  };

  const handleSend = async (overridePrompt?: string) => {
    const clean = (overridePrompt ?? draft).trim();
    if (!clean || chatState.sending) return;
    const queuedAttachments = [...attachments];
    if (!overridePrompt) setDraft('');
    setAttachments([]);
    await sendMuseMessage(clean, queuedAttachments);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const isBusy = chatState.sending || chatState.streaming;
  const starterPrompts = [
    t.quickAssistant.ghost1,
    t.quickAssistant.ghost2,
    t.quickAssistant.ghost3,
  ];

  return (
    <div className="ux flex h-full w-full overflow-hidden bg-[var(--ms-bg)]">
      {/* ── Left Native Assistant & Scheduled Tasks Rail ── */}
      <aside className="hidden lg:flex flex-col w-[272px] shrink-0 h-full border-r border-[var(--ms-border)] bg-[var(--ms-surface)]/55 p-3.5 gap-3.5 overflow-y-auto">
        <Button
          variant="primary"
          className="w-full justify-center"
          icon={<MessageSquarePlus size={15} />}
          onClick={() => void startNewMuseChat()}
        >
          {t.chat.newChat}
        </Button>

        {/* Live Synced Agent Profile Card */}
        <div className="p-3.5 ms-card-raised space-y-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ms-text-muted)]">
            {t.chat.agentCardTitle}
          </div>
          <div className="flex items-center gap-3">
            {chatState.agentAvatarUrl ? (
              <img
                src={chatState.agentAvatarUrl}
                alt={chatState.agentName}
                className="w-10 h-10 rounded-full object-cover border border-[var(--ms-border)] shrink-0"
              />
            ) : (
              <div className="shrink-0">
                <BrandLogo size={38} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div
                data-testid="native-agent-name"
                className="text-[14.5px] font-semibold truncate text-[var(--ms-text-primary)]"
              >
                {chatState.agentName || t.app.shortName}
              </div>
              <div className="mt-0.5">
                <StatusBadge
                  tone={
                    isBusy
                      ? 'accent'
                      : chatState.agentConnected || chatState.authenticated
                        ? 'success'
                        : 'warning'
                  }
                >
                  {isBusy
                    ? t.chat.streamingBadge
                    : chatState.agentConnected || chatState.authenticated
                      ? t.chat.connectedBadge
                      : t.chat.waitingSignInBadge}
                </StatusBadge>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled & Recent Tasks from Muse */}
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11.5px] font-semibold text-[var(--ms-text-secondary)]">
              {t.chat.scheduledTitle}
            </span>
            {chatState.scheduledTasks.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--ms-surface-elevated)] border border-[var(--ms-border)] text-[10.5px] font-semibold">
                {chatState.scheduledTasks.length}
              </span>
            )}
          </div>

          {chatState.scheduledTasks.length === 0 ? (
            <div className="p-3.5 rounded-2xl bg-[var(--ms-bg)]/70 border border-[var(--ms-border)] text-[11.5px] text-[var(--ms-text-muted)] leading-relaxed">
              {t.chat.noScheduledTasks}
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto pr-0.5">
              {chatState.scheduledTasks.map((task) => (
                <div
                  key={task.id}
                  data-testid="scheduled-task-card"
                  className="p-3 rounded-2xl bg-[var(--ms-bg)]/80 border border-[var(--ms-border)] flex items-start gap-2.5"
                >
                  {task.completed ? (
                    <CheckCircle2
                      size={14}
                      className="text-[var(--ms-success)] shrink-0 mt-0.5"
                    />
                  ) : (
                    <Clock
                      size={14}
                      className="text-[var(--ms-accent-text)] shrink-0 mt-0.5"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-semibold leading-snug line-clamp-2">
                      {task.title}
                    </div>
                    <div className="text-[11px] text-[var(--ms-text-muted)] mt-0.5 truncate">
                      {task.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Isolated Official Session Window Button */}
        <button
          type="button"
          title={t.chat.openSessionWindowHint}
          onClick={() => void openMuseSignInWindow()}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--ms-bg)] hover:bg-[var(--ms-surface-hover)] border border-[var(--ms-border)] text-left text-[12px] font-semibold flex items-center justify-between gap-2 transition-colors"
        >
          <span className="inline-flex items-center gap-2 min-w-0">
            <KeyRound size={13} className="text-[var(--ms-accent-text)] shrink-0" />
            <span className="truncate">{t.chat.openSessionWindowBtn}</span>
          </span>
          <ExternalLink size={12} className="text-[var(--ms-text-muted)] shrink-0" />
        </button>
      </aside>

      {/* ── Center Native Conversation Stage ── */}
      <section className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Conversation Subheader */}
        <div className="h-[50px] shrink-0 px-5 border-b border-[var(--ms-border)]/70 flex items-center justify-between gap-3 bg-[var(--ms-bg)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="lx-orb" data-active={String(isBusy)} aria-hidden="true" />
            <span className="text-[14.5px] font-semibold truncate">
              {chatState.agentName || t.app.shortName}
            </span>
            <StatusBadge
              tone={
                isBusy
                  ? 'accent'
                  : chatState.authenticated || museState.sessionAuthenticatedHint
                    ? 'success'
                    : 'warning'
              }
            >
              {isBusy
                ? t.chat.streamingBadge
                : chatState.authenticated || museState.sessionAuthenticatedHint
                  ? t.chat.connectedBadge
                  : t.chat.waitingSignInBadge}
            </StatusBadge>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="lg:hidden">
              <Button
                size="sm"
                variant="secondary"
                icon={<MessageSquarePlus size={13} />}
                onClick={() => void startNewMuseChat()}
              >
                {t.chat.newChat}
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              icon={<RefreshCw size={13} className={museState.isLoading ? 'animate-spin' : ''} />}
              onClick={() => void refreshMuseChat()}
            >
              {t.chat.refreshChatBtn}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<KeyRound size={13} />}
              onClick={() => void openMuseSignInWindow()}
              title={t.chat.openSessionWindowHint}
            >
              {t.chat.openSessionWindowBtn}
            </Button>
          </div>
        </div>

        {/* Scrollable Message Stream */}
        <div
          data-testid="native-chat-stream"
          className="flex-1 min-h-0 overflow-y-auto px-5 md:px-8 py-6"
        >
          {!chatState.authenticated &&
          !museState.sessionAuthenticatedHint &&
          chatState.messages.length === 0 ? (
            <div className="max-w-xl mx-auto my-8 p-7 ms-hero-surface space-y-4 text-center">
              <div className="mx-auto w-fit p-3 rounded-[22px] bg-[var(--ms-bg)] border border-[var(--ms-border)]">
                <BrandLogo size={52} />
              </div>
              <h2 className="text-[22px] font-semibold tracking-tight m-0">
                {t.chat.signInTitle}
              </h2>
              <p className="text-[13.5px] text-[var(--ms-text-secondary)] leading-relaxed m-0">
                {t.chat.signInSubtitle}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                <Button
                  size="lg"
                  variant="primary"
                  icon={<KeyRound size={15} />}
                  onClick={() => void openMuseSignInWindow()}
                >
                  {t.chat.signInPrimaryBtn}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  icon={<RefreshCw size={14} />}
                  onClick={() => void refreshMuseChat()}
                >
                  {t.chat.refreshChatBtn}
                </Button>
              </div>
            </div>
          ) : chatState.messages.length === 0 ? (
            <div className="max-w-2xl mx-auto my-6 space-y-5">
              <div className="text-center space-y-2">
                <div className="mx-auto w-fit p-2.5 rounded-[20px] bg-[var(--ms-surface)] border border-[var(--ms-border)]">
                  <BrandLogo size={42} />
                </div>
                <h2 className="text-[22px] font-semibold tracking-tight m-0">
                  {t.chat.emptyTitle}
                </h2>
                <p className="text-[13.5px] text-[var(--ms-text-secondary)] m-0">
                  {t.chat.emptySubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {starterPrompts.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => void handleSend(item)}
                    className="p-4 ms-card-raised hover:border-[var(--ms-accent)] text-left flex items-center justify-between gap-3 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2.5 text-[13.5px] font-medium">
                      <Sparkles size={15} className="text-[var(--ms-accent-text)] shrink-0" />
                      <span>{item}</span>
                    </span>
                    <ArrowUp size={14} className="text-[var(--ms-text-muted)] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {chatState.messages.map((msg: MuseChatMessage, index: number) => {
                const prevTs = index > 0 ? chatState.messages[index - 1].timestamp : null;
                const showTs = Boolean(msg.timestamp && msg.timestamp !== prevTs);
                const isUser = msg.role === 'user';

                return (
                  <React.Fragment key={msg.id}>
                    {showTs && (
                      <div className="flex justify-center py-1">
                        <span className="px-3 py-0.5 rounded-full bg-[var(--ms-surface)] border border-[var(--ms-border)] text-[11px] text-[var(--ms-text-muted)]">
                          {msg.timestamp}
                        </span>
                      </div>
                    )}

                    <div
                      data-testid={`chat-bubble-${msg.role}`}
                      className={`flex items-start gap-3 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isUser && (
                        <div className="shrink-0 mt-1">
                          {chatState.agentAvatarUrl ? (
                            <img
                              src={chatState.agentAvatarUrl}
                              alt={chatState.agentName}
                              className="w-7 h-7 rounded-full object-cover border border-[var(--ms-border)]"
                            />
                          ) : (
                            <BrandLogo size={26} />
                          )}
                        </div>
                      )}

                      <div
                        className={`group relative max-w-[82%] ${
                          isUser
                            ? 'px-4 py-3 rounded-[22px] rounded-br-[6px] bg-[var(--ms-accent-subtle)] border border-[var(--ms-accent)]/35 text-[var(--ms-text-primary)]'
                            : 'px-5 py-4 rounded-[22px] rounded-bl-[6px] ms-card-raised text-[var(--ms-text-primary)]'
                        }`}
                      >
                        <FormattedMessageBody
                          text={msg.text}
                          copyLabel={t.chat.copyBtn}
                          onCopyCode={(code) => void handleCopy(code)}
                        />

                        {!isUser && (
                          <div className="mt-2 pt-1.5 border-t border-[var(--ms-border)]/50 flex items-center justify-between text-[11px] text-[var(--ms-text-muted)]">
                            <span>{chatState.agentName || t.app.shortName}</span>
                            <button
                              type="button"
                              onClick={() => void handleCopy(msg.text, msg.id)}
                              className="inline-flex items-center gap-1 bg-transparent border-0 p-0 text-[11px] text-[var(--ms-text-muted)] hover:text-[var(--ms-text-primary)] transition-colors"
                            >
                              {copiedId === msg.id ? <Check size={11} /> : <Copy size={11} />}
                              <span>{copiedId === msg.id ? t.common.copied : t.chat.copyBtn}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              {isBusy && (
                <div className="flex items-center gap-2.5 pl-10 text-[12px] text-[var(--ms-accent-text)] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[var(--ms-lime)] animate-pulse" />
                  <span>{t.chat.streamingHint}</span>
                </div>
              )}

              <div ref={feedEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Native Composer */}
        <div className="shrink-0 px-5 md:px-8 pb-4 pt-2 bg-[var(--ms-bg)]">
          <div className="max-w-3xl mx-auto p-3.5 ms-card-raised focus-within:border-[var(--ms-accent)] transition-colors">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {attachments.map((filePath) => (
                  <span
                    key={filePath}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[11.5px]"
                  >
                    <Paperclip size={11} className="text-[var(--ms-accent-text)]" />
                    <span className="max-w-[180px] truncate">{getFileBaseName(filePath)}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) => prev.filter((item) => item !== filePath))
                      }
                      className="bg-transparent border-0 p-0 text-[var(--ms-text-muted)] hover:text-[var(--ms-text-primary)]"
                      aria-label={t.common.close}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              data-testid="native-chat-input"
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.chat.composerPlaceholder}
              className="ms-bare-input w-full resize-none bg-transparent border-0 outline-none text-[14.5px] text-[var(--ms-text-primary)] leading-relaxed max-h-40"
            />

            <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-[var(--ms-border)]/70">
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Paperclip size={14} />}
                  onClick={() => void handlePickAttachments()}
                >
                  {t.chat.attachBtn}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Camera size={14} />}
                  onClick={() => void handleCaptureScreen()}
                >
                  {t.chat.captureBtn}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<ClipboardPaste size={14} />}
                  onClick={() => void handlePasteClipboard()}
                >
                  {t.chat.pasteBtn}
                </Button>
              </div>

              <Button
                size="sm"
                variant="primary"
                data-testid="native-chat-send"
                loading={chatState.sending}
                disabled={!draft.trim()}
                icon={<ArrowUp size={14} />}
                onClick={() => void handleSend()}
              >
                {t.chat.sendBtn}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

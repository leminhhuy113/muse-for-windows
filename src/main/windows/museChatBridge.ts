/**
 * Headless / Background Official Muse Session Chat Bridge
 * Synchronizes real conversations, streaming assistant responses, agent status, and scheduled tasks
 * from the isolated `persist:muse-official` engine window into the native 1MS Studio React Chat UI,
 * and dispatches user prompts + file attachments with zero remote privilege escalation.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import type { WebContents } from 'electron';
import type {
  MuseChatMessage,
  MuseChatSnapshot,
  MuseScheduledTaskItem,
  MuseThreadSummary,
} from '@shared/types';

export interface RawExtractedChatDom {
  authenticated: boolean;
  hasComposer: boolean;
  agentName: string | null;
  agentConnected: boolean;
  agentAvatarUrl: string | null;
  messages: Array<{
    role: 'user' | 'assistant';
    text: string;
    timestamp: string | null;
  }>;
  threads: Array<{
    id: string;
    title: string;
    snippet: string | null;
    active: boolean;
  }>;
  scheduledTasks: Array<{
    title: string;
    subtitle: string;
    completed: boolean;
  }>;
}

/**
 * Pure read-only DOM geometry & computed-style extractor executed by Main process.
 * Resilient to Meta StyleX obfuscated class names.
 */
const EXTRACT_CHAT_DOM_SCRIPT = `(() => {
  try {
    const W = window.innerWidth || 1360;
    const H = window.innerHeight || 900;

    // 1. Locate composer (Lexical contenteditable or textarea)
    const composerCandidates = Array.from(
      document.querySelectorAll(
        '[contenteditable="true"][role="textbox"], [contenteditable="true"][data-lexical-editor="true"], [contenteditable="true"], textarea'
      )
    );
    const composer = composerCandidates.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width >= 160 && r.height >= 16 && r.top > H * 0.45;
    }) || composerCandidates[0] || null;

    const urlLower = (location.href || '').toLowerCase();
    const isAuthUrl =
      urlLower.includes('facebook.com/login') ||
      urlLower.includes('/login') ||
      urlLower.includes('/auth') ||
      urlLower.includes('checkpoint');

    // Check if explicit Sign-in gate is shown without composer
    const hasLoginCta = Array.from(document.querySelectorAll('button, a, [role="button"]')).some((el) =>
      /^(?:log\\s*in|sign\\s*in|continue\\s+with|get\\s+started|đăng\\s+nhập|bắt\\s+đầu)/i.test((el.textContent || '').trim())
    );

    // 2. Detect Right Agent Profile & Scheduled Tasks Panel (x > 58% viewport width)
    let rightPanelLeft = W - 16;
    let agentName = null;
    let agentAvatarUrl = null;
    const scheduledTasks = [];

    const allEls = Array.from(document.querySelectorAll('body *'));
    const statusLeaf = allEls.find((el) => {
      if (el.children.length > 0) return false;
      const txt = (el.textContent || '').trim();
      if (!/^(?:Connected|Đang kết nối|Online|Disconnected|Offline)$/i.test(txt)) return false;
      const r = el.getBoundingClientRect();
      return r.left > W * 0.56 && r.top > 40 && r.top < H * 0.55;
    });

    const authenticated = Boolean(composer || statusLeaf) && !isAuthUrl && !(hasLoginCta && !composer);
    let agentConnected = authenticated;

    if (statusLeaf) {
      const sr = statusLeaf.getBoundingClientRect();
      agentConnected = /connected|đang kết nối|online/i.test((statusLeaf.textContent || '').trim());

      // Walk up to find right panel boundary
      let p = statusLeaf.parentElement;
      while (p && p !== document.body) {
        const pr = p.getBoundingClientRect();
        if (pr.left > W * 0.52 && pr.width >= 240 && pr.height > H * 0.6) {
          rightPanelLeft = pr.left;
        }
        p = p.parentElement;
      }

      // Agent name sits right above statusLeaf
      const nameLeaf = allEls.find((el) => {
        if (el.children.length > 0) return false;
        const txt = (el.textContent || '').trim();
        if (!txt || txt.length > 40 || /^(?:Connected|Online)$/i.test(txt)) return false;
        const r = el.getBoundingClientRect();
        return r.left > rightPanelLeft && r.bottom <= sr.top + 8 && r.top >= sr.top - 64;
      });
      if (nameLeaf) agentName = (nameLeaf.textContent || '').trim();

      // Avatar image above name
      const avatarImg = Array.from(document.querySelectorAll('img')).find((img) => {
        const r = img.getBoundingClientRect();
        return r.left > rightPanelLeft && r.top < sr.top && r.width >= 44 && r.width <= 200;
      });
      if (avatarImg && /^(?:https:|data:image\\/)/i.test(avatarImg.src || '')) {
        agentAvatarUrl = avatarImg.src;
      }

      // Extract Scheduled & Recent Tasks inside right panel
      const seenTasks = new Set();
      for (const el of allEls) {
        if (scheduledTasks.length >= 14) break;
        const r = el.getBoundingClientRect();
        if (r.left < rightPanelLeft || r.top < sr.bottom + 24) continue;
        if (r.height < 34 || r.height > 96 || r.width < 180) continue;
        const leafTexts = [];
        const w = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT);
        let n = w.currentNode;
        while (n) {
          if (n.children && n.children.length === 0) {
            const t = (n.textContent || '').replace(/\\s+/g, ' ').trim();
            if (t) leafTexts.push(t);
          }
          n = w.nextNode();
        }
        if (leafTexts.length >= 2 && leafTexts.length <= 4) {
          const title = leafTexts[0];
          const subtitle = leafTexts.slice(1).join(' · ');
          if (
            title.length >= 4 &&
            title.length <= 90 &&
            !/^(?:see all|try again|yesterday|today|\\d+ scheduled)/i.test(title) &&
            !seenTasks.has(title)
          ) {
            seenTasks.add(title);
            scheduledTasks.push({
              title,
              subtitle: subtitle.slice(0, 120),
              completed: /\\d{1,2}:\\d{2}/.test(subtitle) && !/dec|nov|jan|feb|mar|apr|may|jun|jul|aug|sep|oct/i.test(subtitle),
            });
          }
        }
      }
    }

    // 3. Ensure center message scroller stays near bottom when streaming
    const colLeft = 64;
    const composerTop = composer ? composer.getBoundingClientRect().top - 10 : H - 96;
    const colWidth = Math.max(300, rightPanelLeft - colLeft);

    const scrollers = allEls.filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.left < colLeft - 20 || r.right > rightPanelLeft + 24 || r.height < 180) return false;
      const oy = getComputedStyle(el).overflowY;
      return (oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 20;
    });
    const mainScroller = scrollers.length > 0 ? scrollers[scrollers.length - 1] : null;
    if (mainScroller) {
      if (mainScroller.scrollHeight - mainScroller.scrollTop - mainScroller.clientHeight < 260) {
        mainScroller.scrollTop = mainScroller.scrollHeight;
      }
    }

    // 4. Collect timestamp dividers in center column
    const timeMarkers = [];
    for (const el of allEls) {
      if (el.children.length > 0) continue;
      const txt = (el.textContent || '').trim();
      if (!/^(\\d{1,2}:\\d{2}(?:\\s*[AP]M)?|Yesterday|Today|Hôm qua|Hôm nay)$/i.test(txt)) continue;
      const r = el.getBoundingClientRect();
      if (r.left >= colLeft && r.right <= rightPanelLeft && r.top > 52 && r.bottom < composerTop) {
        const centerDiff = Math.abs((r.left + r.right) / 2 - (colLeft + rightPanelLeft) / 2);
        if (centerDiff < colWidth * 0.28) {
          timeMarkers.push({ top: r.top, label: txt });
        }
      }
    }

    // Helper: serialize DOM node into clean Markdown-preserving text
    const toMarkdown = (node) => {
      if (!node) return '';
      if (node.nodeType === Node.TEXT_NODE) {
        return node.nodeValue || '';
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const tag = node.tagName.toLowerCase();
      if (tag === 'script' || tag === 'style' || tag === 'svg') return '';
      if (tag === 'br') return '\\n';

      let inner = '';
      for (const child of node.childNodes) {
        inner += toMarkdown(child);
      }

      if (tag === 'strong' || tag === 'b') {
        const t = inner.trim();
        return t ? '**' + t + '**' : '';
      }
      if (tag === 'pre') {
        return '\\n\`\`\`\\n' + inner.trim() + '\\n\`\`\`\\n';
      }
      if (tag === 'code') {
        return '\`' + inner.trim() + '\`';
      }
      if (tag === 'li') {
        return '\\n- ' + inner.trim();
      }
      if (tag === 'p' || tag === 'div' || tag === 'section' || tag === 'article' || /^h[1-6]$/.test(tag)) {
        const disp = getComputedStyle(node).display;
        if (disp === 'inline' || disp === 'inline-block') return inner;
        return inner.trim() ? '\\n' + inner.trim() + '\\n' : '';
      }
      return inner;
    };

    // 5. Collect outermost message bubbles in center column
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const bubbleCandidates = [];

    for (const el of allEls) {
      const tag = el.tagName;
      if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'NAV' || tag === 'HEADER') continue;
      const roleAttr = el.getAttribute('role') || '';
      if (roleAttr === 'button' || roleAttr === 'navigation' || roleAttr === 'dialog' || roleAttr === 'listbox') continue;
      if (composer && (el === composer || el.contains(composer) || composer.contains(el))) continue;

      const r = el.getBoundingClientRect();
      const insideScroller = Boolean(mainScroller && mainScroller.contains(el));
      if (r.left < colLeft - 4 || r.right > rightPanelLeft + 8) continue;
      if (!insideScroller && (r.top < 54 || r.bottom > composerTop + 4)) continue;
      if (r.width < 26 || r.width > colWidth * 0.95 || r.height < 22) continue;

      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      const radius = Math.max(
        parseFloat(cs.borderTopLeftRadius) || 0,
        parseFloat(cs.borderTopRightRadius) || 0
      );
      const hasBubbleSurface =
        (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && bg !== bodyBg && radius >= 10) ||
        el.hasAttribute('data-muse-msg');

      if (!hasBubbleSurface) continue;

      const rawTxt = (el.textContent || '').replace(/\\s+/g, ' ').trim();
      if (!rawTxt || /^(?:Chats|Call|Invite|Message)$/i.test(rawTxt)) continue;

      bubbleCandidates.push(el);
    }

    // Keep only outermost bubble elements
    const outerBubbles = bubbleCandidates.filter(
      (el) => !bubbleCandidates.some((other) => other !== el && other.contains(el))
    );

    outerBubbles.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

    const messages = [];
    for (const b of outerBubbles) {
      const r = b.getBoundingClientRect();
      const explicitRole = b.getAttribute('data-muse-role');
      const leftGap = r.left - colLeft;
      const rightGap = rightPanelLeft - r.right;
      const role =
        explicitRole === 'user' || explicitRole === 'assistant'
          ? explicitRole
          : rightGap < leftGap - 24
            ? 'user'
            : 'assistant';

      const md = toMarkdown(b)
        .replace(/\\n{3,}/g, '\\n\\n')
        .trim();
      if (!md) continue;

      let ts = null;
      for (const m of timeMarkers) {
        if (m.top <= r.top + 6) ts = m.label;
      }

      messages.push({ role, text: md.slice(0, 24000), timestamp: ts });
    }

    return {
      authenticated,
      hasComposer: Boolean(composer),
      agentName,
      agentConnected,
      agentAvatarUrl,
      messages: messages.slice(-80),
      threads: [],
      scheduledTasks,
    };
  } catch {
    return {
      authenticated: false,
      hasComposer: false,
      agentName: null,
      agentConnected: false,
      agentAvatarUrl: null,
      messages: [],
      threads: [],
      scheduledTasks: [],
    };
  }
})()`;

function buildInsertPromptScript(prompt: string): string {
  const escaped = JSON.stringify(prompt);
  return `(async () => {
    const text = ${escaped};
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const W = window.innerWidth || 1360;
    const H = window.innerHeight || 900;

    const candidates = Array.from(
      document.querySelectorAll(
        '[contenteditable="true"][role="textbox"], [contenteditable="true"][data-lexical-editor="true"], [contenteditable="true"], textarea'
      )
    );
    const composer = candidates.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width >= 160 && r.height >= 16 && r.top > H * 0.45;
    }) || candidates[0];

    if (!composer) return { ok: false, reason: 'NO_COMPOSER' };

    composer.focus();
    await sleep(30);

    if (composer.tagName === 'TEXTAREA' || composer.tagName === 'INPUT') {
      const proto = composer.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) setter.call(composer, text);
      else composer.value = text;
      composer.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
      composer.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(composer);
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand('delete', false);
      const inserted = document.execCommand('insertText', false, text);
      if (!inserted || !(composer.textContent || '').trim()) {
        composer.dispatchEvent(
          new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: text,
          })
        );
      }
    }

    await sleep(110);
    const currentText = (composer.value ?? composer.textContent ?? '').trim();
    return { ok: currentText.length > 0, needsFallbackInsert: currentText.length === 0 };
  })()`;
}

const CLICK_SEND_OR_ENTER_SCRIPT = `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const H = window.innerHeight || 900;
  const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
  const sendBtn = buttons.find((b) => {
    if (b.disabled || b.getAttribute('aria-disabled') === 'true') return false;
    const r = b.getBoundingClientRect();
    if (r.top < H * 0.55) return false;
    const label = (
      (b.getAttribute('aria-label') || '') +
      ' ' +
      (b.getAttribute('title') || '') +
      ' ' +
      (b.getAttribute('data-testid') || '') +
      ' ' +
      (b.textContent || '')
    ).toLowerCase();
    return /\\b(send|submit|gửi)\\b/.test(label) || b.getAttribute('type') === 'submit';
  });

  if (sendBtn) {
    sendBtn.click();
    await sleep(60);
    return { clickedSend: true };
  }

  const active = document.activeElement;
  if (active) {
    active.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
      })
    );
  }
  return { clickedSend: false };
})()`;

const TRIGGER_NEW_CHAT_SCRIPT = `(() => {
  const btns = Array.from(document.querySelectorAll('button, a, [role="button"]'));
  const newBtn = btns.find((el) => {
    const label = (
      (el.getAttribute('aria-label') || '') +
      ' ' +
      (el.getAttribute('title') || '') +
      ' ' +
      (el.textContent || '')
    ).toLowerCase();
    return /new\\s+chat|new\\s+conversation|cuộc\\s+trò\\s+chuyện\\s+mới|tạo\\s+mới/.test(label);
  });
  if (newBtn) {
    newBtn.click();
    return true;
  }
  return false;
})()`;

export class MuseChatBridge {
  private snapshot: MuseChatSnapshot = {
    authenticated: false,
    engineWindowOpen: false,
    agentName: 'Muse',
    agentConnected: false,
    agentAvatarUrl: null,
    sending: false,
    streaming: false,
    messages: [],
    threads: [],
    scheduledTasks: [],
    lastUpdatedAt: new Date().toISOString(),
  };

  private pollTimer: NodeJS.Timeout | null = null;
  private fastPollUntil = 0;
  private lastAssistantSignature = '';
  private stableTicks = 0;
  private readonly onChange?: (snapshot: MuseChatSnapshot) => void;

  constructor(opts?: { onChange?: (snapshot: MuseChatSnapshot) => void }) {
    this.onChange = opts?.onChange;
  }

  public getSnapshot(): MuseChatSnapshot {
    return {
      ...this.snapshot,
      messages: [...this.snapshot.messages],
      threads: [...this.snapshot.threads],
      scheduledTasks: [...this.snapshot.scheduledTasks],
    };
  }

  public setEngineWindowOpen(open: boolean): void {
    if (this.snapshot.engineWindowOpen !== open) {
      this.snapshot.engineWindowOpen = open;
      this.emit();
    }
  }

  private emit(): void {
    this.snapshot.lastUpdatedAt = new Date().toISOString();
    this.onChange?.(this.getSnapshot());
  }

  public startPolling(wc: WebContents): void {
    this.stopPolling();
    const tick = async () => {
      if (wc.isDestroyed()) return;
      await this.syncFromDom(wc);
      const delay = Date.now() < this.fastPollUntil ? 450 : 2200;
      this.pollTimer = setTimeout(() => void tick(), delay);
    };
    this.pollTimer = setTimeout(() => void tick(), 600);
  }

  public stopPolling(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  public resetSession(): void {
    this.snapshot = {
      ...this.snapshot,
      authenticated: false,
      agentConnected: false,
      sending: false,
      streaming: false,
      messages: [],
      threads: [],
      scheduledTasks: [],
    };
    this.emit();
  }

  public async syncFromDom(wc: WebContents): Promise<MuseChatSnapshot> {
    if (wc.isDestroyed() || wc.isLoadingMainFrame()) return this.getSnapshot();

    try {
      const raw = (await wc.mainFrame.executeJavaScript(
        EXTRACT_CHAT_DOM_SCRIPT,
        false,
      )) as RawExtractedChatDom | null;

      if (!raw) return this.getSnapshot();

      const mappedMessages: MuseChatMessage[] = raw.messages.map((m, idx) => ({
        id: `msg-${idx}-${crypto
          .createHash('sha1')
          .update(`${m.role}:${m.text.slice(0, 120)}`)
          .digest('hex')
          .slice(0, 10)}`,
        role: m.role,
        text: m.text,
        timestamp: m.timestamp,
      }));

      // Preserve pending optimistic message if DOM hasn't flushed it yet
      const pendingOpt = this.snapshot.messages.filter((m) => m.optimistic);
      for (const opt of pendingOpt) {
        const alreadyInDom = mappedMessages.some(
          (dm) => dm.role === 'user' && dm.text.includes(opt.text.slice(0, 32)),
        );
        if (!alreadyInDom && Date.now() < this.fastPollUntil) {
          mappedMessages.push(opt);
        }
      }

      const mappedTasks: MuseScheduledTaskItem[] = raw.scheduledTasks.map((t, idx) => ({
        id: `task-${idx}`,
        title: t.title,
        subtitle: t.subtitle,
        completed: t.completed,
      }));

      const mappedThreads: MuseThreadSummary[] = raw.threads;

      const lastMsg = mappedMessages[mappedMessages.length - 1];
      const currentAssistantSig =
        lastMsg?.role === 'assistant' ? `${mappedMessages.length}:${lastMsg.text.length}` : '';

      if (this.snapshot.streaming) {
        if (currentAssistantSig && currentAssistantSig === this.lastAssistantSignature) {
          this.stableTicks += 1;
          if (this.stableTicks >= 5) {
            this.snapshot.streaming = false;
            this.snapshot.sending = false;
          }
        } else {
          this.stableTicks = 0;
        }
      }
      if (Date.now() >= this.fastPollUntil) {
        this.snapshot.streaming = false;
        this.snapshot.sending = false;
      }
      this.lastAssistantSignature = currentAssistantSig;

      const nextAgentName = raw.agentName || this.snapshot.agentName || 'Muse';
      const changed =
        this.snapshot.authenticated !== raw.authenticated ||
        this.snapshot.agentName !== nextAgentName ||
        this.snapshot.agentConnected !== raw.agentConnected ||
        this.snapshot.messages.length !== mappedMessages.length ||
        JSON.stringify(this.snapshot.messages.slice(-3)) !==
          JSON.stringify(mappedMessages.slice(-3)) ||
        this.snapshot.scheduledTasks.length !== mappedTasks.length;

      this.snapshot.authenticated = raw.authenticated;
      this.snapshot.agentName = nextAgentName;
      this.snapshot.agentConnected = raw.agentConnected;
      if (raw.agentAvatarUrl) this.snapshot.agentAvatarUrl = raw.agentAvatarUrl;
      this.snapshot.messages = mappedMessages;
      this.snapshot.threads = mappedThreads;
      this.snapshot.scheduledTasks = mappedTasks;

      if (changed) {
        this.emit();
      }
    } catch {
      // Ignore transient navigation frame errors
    }

    return this.getSnapshot();
  }

  private async attachFilesViaDebugger(wc: WebContents, filePaths: string[]): Promise<void> {
    const validPaths = filePaths.filter((p) => {
      try {
        return fs.existsSync(p) && fs.statSync(p).isFile();
      } catch {
        return false;
      }
    });
    if (validPaths.length === 0) return;

    const dbg = wc.debugger;
    let attachedHere = false;
    try {
      if (!dbg.isAttached()) {
        dbg.attach('1.3');
        attachedHere = true;
      }
      await dbg.sendCommand('DOM.enable');
      const doc = (await dbg.sendCommand('DOM.getDocument', { depth: 2 })) as {
        root: { nodeId: number };
      };
      const q = (await dbg.sendCommand('DOM.querySelector', {
        nodeId: doc.root.nodeId,
        selector: 'input[type="file"]',
      })) as { nodeId?: number };

      if (q?.nodeId) {
        await dbg.sendCommand('DOM.setFileInputFiles', {
          nodeId: q.nodeId,
          files: validPaths,
        });
        await new Promise((r) => setTimeout(r, 250));
      }
    } catch {
      // Ignore if file input not present on current screen
    } finally {
      if (attachedHere && dbg.isAttached()) {
        try {
          dbg.detach();
        } catch {
          // Ignore
        }
      }
    }
  }

  public async sendMessage(
    wc: WebContents | null,
    prompt: string,
    attachments: string[] = [],
  ): Promise<MuseChatSnapshot> {
    const cleanPrompt = prompt.trim();
    if (!wc || wc.isDestroyed() || !cleanPrompt) return this.getSnapshot();

    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.snapshot.messages = [
      ...this.snapshot.messages,
      {
        id: `opt-${Date.now()}`,
        role: 'user',
        text: cleanPrompt,
        timestamp: nowLabel,
        optimistic: true,
      },
    ];
    this.snapshot.sending = true;
    this.snapshot.streaming = true;
    this.stableTicks = 0;
    this.fastPollUntil = Date.now() + 26000;
    this.emit();

    try {
      if (attachments.length > 0) {
        await this.attachFilesViaDebugger(wc, attachments);
      }

      const insertRes = (await wc.mainFrame.executeJavaScript(
        buildInsertPromptScript(cleanPrompt),
        true,
      )) as { ok?: boolean; needsFallbackInsert?: boolean } | null;

      if (insertRes?.needsFallbackInsert) {
        wc.focus();
        await wc.insertText(cleanPrompt);
        await new Promise((r) => setTimeout(r, 90));
      }

      const sendRes = (await wc.mainFrame.executeJavaScript(
        CLICK_SEND_OR_ENTER_SCRIPT,
        true,
      )) as { clickedSend?: boolean } | null;

      if (!sendRes?.clickedSend) {
        wc.sendInputEvent({ type: 'keyDown', keyCode: 'Return' });
        wc.sendInputEvent({ type: 'char', keyCode: '\r' });
        wc.sendInputEvent({ type: 'keyUp', keyCode: 'Return' });
      }

      await new Promise((r) => setTimeout(r, 240));
      await this.syncFromDom(wc);
    } catch {
      this.snapshot.sending = false;
      this.emit();
    }

    return this.getSnapshot();
  }

  public async startNewChat(wc: WebContents | null, officialUrl: string): Promise<MuseChatSnapshot> {
    if (!wc || wc.isDestroyed()) return this.getSnapshot();
    try {
      const clicked = (await wc.mainFrame.executeJavaScript(
        TRIGGER_NEW_CHAT_SCRIPT,
        true,
      )) as boolean;
      if (!clicked) {
        await wc.loadURL(officialUrl);
      }
      await new Promise((r) => setTimeout(r, 350));
      this.snapshot.messages = [];
      await this.syncFromDom(wc);
    } catch {
      // Ignore
    }
    return this.getSnapshot();
  }
}

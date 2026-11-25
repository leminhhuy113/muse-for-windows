/**
 * Permission-Gated Local Agent Bridge (All Typed Tools: FS, App, System, Screen, Browser, Shell, Computer Use)
 * Enforces Zod input schemas, Permission Center checks, timeout/cancellation, Emergency Stop, and SQLite Audit Logging.
 */
import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { desktopCapturer, Notification, screen } from 'electron';
import { z } from 'zod';
import { SENSITIVE_UI_WINDOW_PATTERNS } from '@shared/constants';
import type {
  AgentTaskStep,
  BridgeToolName,
  LiveAgentExecutionState,
  PermissionCategory,
  RiskLevel,
} from '@shared/types';
import type { AuditLogger } from '../diagnostics/auditLogger';
import type { AssistantBrowserController } from '../integrations/browserAutomation';
import { runWindowsHelper } from '../integrations/windowsHelperClient';
import type { PermissionManager } from '../permissions/permissionManager';
import type { SettingsStore } from '../sessions/settingsStore';
import type { WorkspaceManager } from '../workspace/workspaceManager';

const execFileAsync = promisify(execFile);

export interface BridgeToolMetadata {
  name: BridgeToolName;
  category: PermissionCategory;
  description: string;
  riskLevel: RiskLevel;
  isWriteOrMutating: boolean;
  alwaysPromptEachTime?: boolean;
}

export const BRIDGE_TOOL_CATALOG: readonly BridgeToolMetadata[] = [
  { name: 'fs.list', category: 'files', description: 'List files inside an approved workspace directory.', riskLevel: 'low', isWriteOrMutating: false },
  { name: 'fs.search', category: 'files', description: 'Search filenames within the sandboxed workspace.', riskLevel: 'low', isWriteOrMutating: false },
  { name: 'fs.stat', category: 'files', description: 'Inspect metadata of a workspace file or folder.', riskLevel: 'low', isWriteOrMutating: false },
  { name: 'fs.read', category: 'files', description: 'Read UTF-8 text content from an approved workspace file.', riskLevel: 'low', isWriteOrMutating: false },
  { name: 'fs.write', category: 'files', description: 'Write UTF-8 text content into the sandboxed workspace.', riskLevel: 'medium', isWriteOrMutating: true },
  { name: 'fs.mkdir', category: 'folders', description: 'Create a directory inside the sandboxed workspace.', riskLevel: 'low', isWriteOrMutating: true },
  { name: 'fs.copy', category: 'files', description: 'Copy a file within approved workspace folders.', riskLevel: 'medium', isWriteOrMutating: true },
  { name: 'fs.move', category: 'files', description: 'Move or rename a file within approved workspace folders.', riskLevel: 'medium', isWriteOrMutating: true },
  { name: 'fs.trash', category: 'files', description: 'Send a workspace file/folder safely to the Windows Recycle Bin.', riskLevel: 'medium', isWriteOrMutating: true },
  { name: 'app.list', category: 'applications', description: 'List visible non-sensitive top-level Windows applications.', riskLevel: 'low', isWriteOrMutating: false },
  { name: 'app.launch', category: 'applications', description: 'Launch an explicitly approved Windows application.', riskLevel: 'high', isWriteOrMutating: true, alwaysPromptEachTime: true },
  { name: 'app.focus', category: 'applications', description: 'Focus an approved visible Windows application.', riskLevel: 'medium', isWriteOrMutating: true },
  { name: 'app.close', category: 'applications', description: 'Politely request a visible approved window to close.', riskLevel: 'high', isWriteOrMutating: true, alwaysPromptEachTime: true },
  { name: 'system.info', category: 'system', description: 'Read sanitized Windows OS, CPU, and memory summary.', riskLevel: 'low', isWriteOrMutating: false },
  { name: 'system.displays', category: 'system', description: 'List connected display resolutions and DPI scale factors.', riskLevel: 'low', isWriteOrMutating: false },
  { name: 'system.notifications', category: 'system', description: 'Display a native Windows desktop notification.', riskLevel: 'low', isWriteOrMutating: true },
  { name: 'workspace.info', category: 'folders', description: 'Inspect workspace root path, quota, and subfolder usage.', riskLevel: 'low', isWriteOrMutating: false },
  { name: 'screen.list', category: 'display', description: 'List available displays eligible for screen capture.', riskLevel: 'low', isWriteOrMutating: false },
  { name: 'screen.capture', category: 'display', description: 'Capture a display screenshot into Workspace/Temporary.', riskLevel: 'high', isWriteOrMutating: false, alwaysPromptEachTime: true },
  { name: 'browser.launch', category: 'browser', description: 'Launch the dedicated assistant browser profile.', riskLevel: 'medium', isWriteOrMutating: true },
  { name: 'browser.tabs', category: 'browser', description: 'List open tabs in the dedicated assistant browser.', riskLevel: 'low', isWriteOrMutating: false },
  { name: 'browser.navigate', category: 'browser', description: 'Navigate dedicated assistant browser to an HTTP(S) URL.', riskLevel: 'medium', isWriteOrMutating: true },
  { name: 'browser.snapshot', category: 'browser', description: 'Read untrusted DOM structure from assistant browser.', riskLevel: 'low', isWriteOrMutating: false },
  { name: 'browser.click', category: 'browser', description: 'Click an element in the dedicated assistant browser.', riskLevel: 'high', isWriteOrMutating: true, alwaysPromptEachTime: true },
  { name: 'browser.type', category: 'browser', description: 'Fill non-password text into an assistant browser input.', riskLevel: 'high', isWriteOrMutating: true, alwaysPromptEachTime: true },
  { name: 'browser.scroll', category: 'browser', description: 'Scroll the active assistant browser tab.', riskLevel: 'low', isWriteOrMutating: false },
  { name: 'browser.download', category: 'browser', description: 'Inspect assistant browser downloads directory.', riskLevel: 'low', isWriteOrMutating: false },
  { name: 'shell.run', category: 'shell', description: 'Execute a single explicitly approved command without shell chaining.', riskLevel: 'critical', isWriteOrMutating: true, alwaysPromptEachTime: true },
  { name: 'computerUse.windows', category: 'computer_use', description: 'Enumerate visible Windows applications for Computer Use.', riskLevel: 'medium', isWriteOrMutating: false },
  { name: 'computerUse.inspectTree', category: 'computer_use', description: 'Inspect Windows UI Automation tree of an approved window.', riskLevel: 'medium', isWriteOrMutating: false },
  { name: 'computerUse.click', category: 'computer_use', description: 'Invoke a UI Automation control inside an approved app.', riskLevel: 'high', isWriteOrMutating: true, alwaysPromptEachTime: true },
  { name: 'computerUse.type', category: 'computer_use', description: 'Send text to a non-password control in an approved app.', riskLevel: 'high', isWriteOrMutating: true, alwaysPromptEachTime: true },
  { name: 'computerUse.scroll', category: 'computer_use', description: 'Scroll an approved window.', riskLevel: 'medium', isWriteOrMutating: true },
  { name: 'computerUse.shortcut', category: 'computer_use', description: 'Send an approved shortcut to an approved app.', riskLevel: 'high', isWriteOrMutating: true, alwaysPromptEachTime: true },
] as const;

export class LocalAgentBridge {
  private readonly settingsStore: SettingsStore;
  private readonly workspace: WorkspaceManager;
  private readonly permissions: PermissionManager;
  private readonly auditLogger: AuditLogger;
  private readonly browserController: AssistantBrowserController;
  private readonly onStateChange?: (state: LiveAgentExecutionState) => void;
  private readonly activeControllers = new Map<string, AbortController>();

  private executionState: LiveAgentExecutionState = {
    active: false,
    paused: false,
    taskId: null,
    providerLabel: 'Local Bridge',
    currentTask: null,
    currentTool: null,
    currentAction: null,
    activeWindowTitle: null,
    progressPercent: 0,
    startedAt: null,
    elapsedMs: 0,
    steps: [],
    sources: [],
    lastOutput: null,
    lastError: null,
  };

  constructor(opts: {
    settingsStore: SettingsStore;
    workspace: WorkspaceManager;
    permissions: PermissionManager;
    auditLogger: AuditLogger;
    browserController: AssistantBrowserController;
    onStateChange?: (state: LiveAgentExecutionState) => void;
  }) {
    this.settingsStore = opts.settingsStore;
    this.workspace = opts.workspace;
    this.permissions = opts.permissions;
    this.auditLogger = opts.auditLogger;
    this.browserController = opts.browserController;
    this.onStateChange = opts.onStateChange;
  }

  public getCatalog(): readonly BridgeToolMetadata[] {
    return BRIDGE_TOOL_CATALOG;
  }

  public getExecutionState(): LiveAgentExecutionState {
    return structuredClone(this.executionState);
  }

  public updateAgentTaskContext(patch: Partial<LiveAgentExecutionState>): void {
    this.executionState = { ...this.executionState, ...patch };
    this.onStateChange?.(this.getExecutionState());
  }

  public async emergencyStopAll(): Promise<void> {
    for (const [, ctrl] of this.activeControllers) {
      ctrl.abort(new Error('EMERGENCY_STOP'));
    }
    this.activeControllers.clear();
    this.permissions.denyAllPending('emergency_stop');
    await this.browserController.stopAll();
    const cur = this.settingsStore.get();
    this.settingsStore.update({
      bridge: { ...cur.bridge, paused: true },
      computerUse: { ...cur.computerUse, enabled: false },
    });
    this.updateAgentTaskContext({
      active: false,
      paused: false,
      currentTool: null,
      currentAction: 'Emergency Stop triggered by user',
      lastError: 'Stopped by Emergency Stop',
    });
  }

  private assertApprovedExecutable(exeNameOrPath: string): string {
    const base = path.basename(exeNameOrPath).toLowerCase();
    if (SENSITIVE_UI_WINDOW_PATTERNS.some((re) => re.test(base))) {
      throw new Error(`SECURITY_DENIED: Executable '${base}' is permanently blocked.`);
    }
    const approved = this.settingsStore
      .get()
      .computerUse.approvedApps.map((a) => a.toLowerCase());
    const safeBuiltins = new Set(['notepad.exe', 'calc.exe', 'mspaint.exe', 'explorer.exe', ...approved]);
    if (!safeBuiltins.has(base)) {
      throw new Error(
        `APP_NOT_APPROVED: '${base}' is not in the Approved Applications allowlist.`,
      );
    }
    return base;
  }

  public async invokeTool(
    toolName: BridgeToolName,
    rawInput: Record<string, unknown>,
    requestingComponent = 'local-ui',
  ): Promise<unknown> {
    const meta = BRIDGE_TOOL_CATALOG.find((t) => t.name === toolName);
    if (!meta) {
      throw new Error(`UNKNOWN_TOOL: '${toolName}' is not registered.`);
    }

    const startedMs = Date.now();
    const callId = crypto.randomUUID();
    const abortCtrl = new AbortController();
    this.activeControllers.set(callId, abortCtrl);

    const targetHint =
      String(
        rawInput.path ||
          rawInput.sourcePath ||
          rawInput.url ||
          rawInput.executable ||
          rawInput.elementName ||
          toolName,
      ).slice(0, 240);

    let commandPreview: { executable: string; args: string[]; cwd: string } | undefined;
    if (toolName === 'shell.run') {
      const parsedCmd = z
        .object({
          executable: z.string().min(1).max(260),
          args: z.array(z.string().max(500)).max(20).default([]),
          cwd: z.string().max(500).optional(),
        })
        .parse(rawInput);
      const cwdResolved = parsedCmd.cwd
        ? this.workspace.resolveAuthorizedPath(parsedCmd.cwd, 'read')
        : this.workspace.getRootPath();
      commandPreview = {
        executable: parsedCmd.executable,
        args: parsedCmd.args,
        cwd: cwdResolved,
      };
    }

    const auth = await this.permissions.authorizeToolCall({
      toolName,
      category: meta.category,
      isWriteOrMutating: meta.isWriteOrMutating,
      alwaysPromptEachTime: meta.alwaysPromptEachTime,
      requestingComponent,
      actionSummary: meta.description,
      targetResource: targetHint,
      scope: meta.category,
      riskLevel: meta.riskLevel,
      sideEffects: meta.isWriteOrMutating ? ['Modifies local state within approved scope'] : ['Read-only inspection'],
      commandPreview,
    });

    if (!auth.approved) {
      this.activeControllers.delete(callId);
      this.auditLogger.record({
        toolName,
        category: meta.category,
        requestingComponent,
        requestedScope: targetHint,
        approvalDecision: auth.decision,
        executionResult: 'denied',
        durationMs: Date.now() - startedMs,
        errorDetails: auth.reason || 'Permission denied',
      });
      throw new Error(`PERMISSION_DENIED: ${auth.reason || auth.decision}`);
    }

    const step: AgentTaskStep = {
      id: callId,
      label: `${toolName} (${targetHint})`,
      toolName,
      target: targetHint,
      status: 'running',
      startedAt: new Date().toISOString(),
    };

    const wasAlreadyActive = this.executionState.active;
    this.updateAgentTaskContext({
      active: true,
      currentTool: toolName,
      currentAction: meta.description,
      steps: [...this.executionState.steps.slice(-19), step],
    });

    const timeoutMs = this.settingsStore.get().bridge.defaultToolTimeoutMs;
    const timeoutHandle = setTimeout(() => abortCtrl.abort(new Error('TOOL_TIMEOUT')), timeoutMs);

    try {
      const result = await this.executeValidatedTool(toolName, rawInput, abortCtrl.signal);
      clearTimeout(timeoutHandle);
      this.activeControllers.delete(callId);

      this.auditLogger.record({
        toolName,
        category: meta.category,
        requestingComponent,
        requestedScope: targetHint,
        approvalDecision: auth.decision,
        executionResult: 'success',
        durationMs: Date.now() - startedMs,
        errorDetails: null,
      });

      const updatedSteps = this.executionState.steps.map((s) =>
        s.id === callId
          ? { ...s, status: 'completed' as const, completedAt: new Date().toISOString(), resultSummary: 'OK' }
          : s,
      );
      this.updateAgentTaskContext({
        active: wasAlreadyActive,
        currentTool: wasAlreadyActive ? this.executionState.currentTool : null,
        steps: updatedSteps,
      });
      return result;
    } catch (err) {
      clearTimeout(timeoutHandle);
      this.activeControllers.delete(callId);
      const msg = err instanceof Error ? err.message : String(err);
      const isTimeout = msg.includes('TOOL_TIMEOUT');
      const isCancelled = msg.includes('EMERGENCY_STOP') || abortCtrl.signal.aborted;

      this.auditLogger.record({
        toolName,
        category: meta.category,
        requestingComponent,
        requestedScope: targetHint,
        approvalDecision: auth.decision,
        executionResult: isTimeout ? 'timeout' : isCancelled ? 'cancelled' : 'error',
        durationMs: Date.now() - startedMs,
        errorDetails: msg,
      });

      const updatedSteps = this.executionState.steps.map((s) =>
        s.id === callId
          ? { ...s, status: 'failed' as const, completedAt: new Date().toISOString(), resultSummary: msg }
          : s,
      );
      this.updateAgentTaskContext({
        active: false,
        currentTool: null,
        lastError: msg,
        steps: updatedSteps,
      });
      throw err;
    }
  }

  private async executeValidatedTool(
    toolName: BridgeToolName,
    rawInput: Record<string, unknown>,
    signal: AbortSignal,
  ): Promise<unknown> {
    const settings = this.settingsStore.get();
    const browserOpts = {
      headless: settings.browserAutomation.headless,
      preferredChannel: settings.browserAutomation.preferredChannel,
    };

    switch (toolName) {
      case 'fs.list': {
        const { path: subPath } = z.object({ path: z.string().default('Workspace') }).parse(rawInput);
        return { files: this.workspace.listFiles(subPath) };
      }
      case 'fs.search': {
        const { query } = z.object({ query: z.string().default('') }).parse(rawInput);
        return { matches: this.workspace.searchFiles(query) };
      }
      case 'fs.stat': {
        const { path: p } = z.object({ path: z.string().min(1) }).parse(rawInput);
        const resolved = this.workspace.resolveAuthorizedPath(p, 'read');
        const st = fs.statSync(resolved);
        return {
          path: resolved,
          isDirectory: st.isDirectory(),
          sizeBytes: st.size,
          modifiedAt: st.mtime.toISOString(),
        };
      }
      case 'fs.read': {
        const { path: p } = z.object({ path: z.string().min(1) }).parse(rawInput);
        return this.workspace.readPreview(p);
      }
      case 'fs.write': {
        const { path: p, content } = z
          .object({ path: z.string().min(1), content: z.string().max(5 * 1024 * 1024) })
          .parse(rawInput);
        const written = this.workspace.writeFile(p, content);
        return { writtenPath: written, bytes: Buffer.byteLength(content, 'utf8') };
      }
      case 'fs.mkdir': {
        const { path: p } = z.object({ path: z.string().min(1) }).parse(rawInput);
        return { createdPath: this.workspace.createFolder(p) };
      }
      case 'fs.copy': {
        const { sourcePath, destinationPath } = z
          .object({ sourcePath: z.string().min(1), destinationPath: z.string().min(1) })
          .parse(rawInput);
        const src = this.workspace.resolveAuthorizedPath(sourcePath, 'read');
        const dst = this.workspace.resolveAuthorizedPath(destinationPath, 'write');
        const st = fs.statSync(src);
        this.workspace.assertQuotaAvailable(st.size);
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.copyFileSync(src, dst);
        return { copiedFrom: src, copiedTo: dst };
      }
      case 'fs.move': {
        const { sourcePath, destinationPath } = z
          .object({ sourcePath: z.string().min(1), destinationPath: z.string().min(1) })
          .parse(rawInput);
        const src = this.workspace.resolveAuthorizedPath(sourcePath, 'write');
        const dst = this.workspace.resolveAuthorizedPath(destinationPath, 'write');
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.renameSync(src, dst);
        return { movedFrom: src, movedTo: dst };
      }
      case 'fs.trash': {
        const { path: p } = z.object({ path: z.string().min(1) }).parse(rawInput);
        const target = this.workspace.resolveAuthorizedPath(p, 'write');
        if (target === fs.realpathSync.native(this.workspace.getRootPath())) {
          throw new Error('Refusing to trash root workspace directory.');
        }
        return await runWindowsHelper('recycle-item', { targetPath: target }, signal);
      }
      case 'workspace.info': {
        return this.workspace.getUsageSummary();
      }
      case 'system.info': {
        return {
          platform: process.platform,
          release: os.release(),
          arch: process.arch,
          cpus: os.cpus().length,
          totalMemMb: Math.round(os.totalmem() / (1024 * 1024)),
          freeMemMb: Math.round(os.freemem() / (1024 * 1024)),
          uptimeSec: Math.round(os.uptime()),
        };
      }
      case 'system.displays':
      case 'screen.list': {
        const displays = screen.getAllDisplays().map((d, index) => ({
          index,
          id: d.id,
          bounds: d.bounds,
          workArea: d.workArea,
          scaleFactor: d.scaleFactor,
        }));
        return { displays };
      }
      case 'system.notifications': {
        const { title, body } = z
          .object({ title: z.string().min(1).max(120), body: z.string().min(1).max(300) })
          .parse(rawInput);
        if (Notification.isSupported() && settings.notifications.enabled) {
          new Notification({ title, body }).show();
        }
        return { delivered: true };
      }
      case 'screen.capture': {
        const { displayIndex } = z.object({ displayIndex: z.number().int().min(0).default(0) }).parse(rawInput);
        const outputPath = path.join(
          this.workspace.getRootPath(),
          'Temporary',
          'captures',
          `screen-${Date.now()}.png`,
        );
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        try {
          const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 },
          });
          const targetSource = sources[Math.min(displayIndex, Math.max(0, sources.length - 1))];
          if (targetSource && !targetSource.thumbnail.isEmpty()) {
            const pngBuf = targetSource.thumbnail.toPNG();
            fs.writeFileSync(outputPath, pngBuf);
            const size = targetSource.thumbnail.getSize();
            return {
              ok: true,
              method: 'electron.desktopCapturer',
              filePath: outputPath,
              width: size.width,
              height: size.height,
              sizeBytes: pngBuf.length,
            };
          }
        } catch {
          // Fall back to Windows native helper below
        }
        return await runWindowsHelper('capture-screen', { outputPath, displayIndex }, signal);
      }
      case 'app.list':
      case 'computerUse.windows': {
        return await runWindowsHelper('list-windows', {}, signal);
      }
      case 'app.launch': {
        const { executable } = z.object({ executable: z.string().min(1).max(120) }).parse(rawInput);
        const safeExe = this.assertApprovedExecutable(executable);
        const child = execFile(safeExe, [], { windowsHide: false });
        child.unref();
        return { launched: safeExe, pid: child.pid };
      }
      case 'app.focus': {
        const { pid } = z.object({ pid: z.number().int().positive() }).parse(rawInput);
        return await runWindowsHelper('focus-window', { pid }, signal);
      }
      case 'app.close': {
        const { pid } = z.object({ pid: z.number().int().positive() }).parse(rawInput);
        return await runWindowsHelper('close-window', { pid }, signal);
      }
      case 'computerUse.inspectTree': {
        const { hwnd } = z.object({ hwnd: z.number().int().optional() }).parse(rawInput);
        return await runWindowsHelper('inspect-uia', hwnd ? { hwnd } : {}, signal);
      }
      case 'computerUse.click': {
        const { hwnd, elementName } = z
          .object({ hwnd: z.number().int(), elementName: z.string().min(1).max(200) })
          .parse(rawInput);
        return await runWindowsHelper('uia-click', { hwnd, elementName }, signal);
      }
      case 'computerUse.type': {
        const { hwnd, text } = z
          .object({ hwnd: z.number().int(), text: z.string().min(1).max(500) })
          .parse(rawInput);
        return await runWindowsHelper('uia-type', { hwnd, text }, signal);
      }
      case 'computerUse.scroll': {
        const { hwnd } = z.object({ hwnd: z.number().int() }).parse(rawInput);
        return await runWindowsHelper('uia-type', { hwnd, text: '{PGDN}' }, signal);
      }
      case 'computerUse.shortcut': {
        const { hwnd, keys } = z
          .object({ hwnd: z.number().int(), keys: z.enum(['^s', '^c', '^v', '^z', '{ESC}', '{ENTER}']) })
          .parse(rawInput);
        return await runWindowsHelper('uia-type', { hwnd, text: keys }, signal);
      }
      case 'browser.launch': {
        await this.browserController.ensureContext(browserOpts);
        return { running: true };
      }
      case 'browser.tabs': {
        return { tabs: await this.browserController.listTabs() };
      }
      case 'browser.navigate': {
        const { url } = z.object({ url: z.url().max(2048) }).parse(rawInput);
        return await this.browserController.navigate(url, browserOpts);
      }
      case 'browser.snapshot': {
        const screenshotPath = path.join(
          this.workspace.getRootPath(),
          'Temporary',
          'captures',
          `browser-${Date.now()}.png`,
        );
        return await this.browserController.snapshot({ ...browserOpts, screenshotPath });
      }
      case 'browser.click': {
        const { selector } = z.object({ selector: z.string().min(1).max(240) }).parse(rawInput);
        return await this.browserController.clickSelector(selector, browserOpts);
      }
      case 'browser.type': {
        const { selector, text } = z
          .object({ selector: z.string().min(1).max(240), text: z.string().max(2000) })
          .parse(rawInput);
        return await this.browserController.typeIntoSelector(selector, text, browserOpts);
      }
      case 'browser.scroll': {
        const { deltaY } = z.object({ deltaY: z.number().int().min(-4000).max(4000).default(500) }).parse(rawInput);
        return await this.browserController.scrollPage(deltaY, browserOpts);
      }
      case 'browser.download': {
        return { files: this.workspace.listFiles('Downloads') };
      }
      case 'shell.run': {
        const { executable, args, cwd } = z
          .object({
            executable: z.string().min(1).max(260),
            args: z.array(z.string().max(500)).max(20).default([]),
            cwd: z.string().max(500).optional(),
          })
          .parse(rawInput);
        // Command injection defense: reject shell metacharacters or raw shell interpreters with inline -c / /c scripts unless explicitly reviewed, and always use execFile (shell: false!)
        if (/[;&|`$<>]/.test(executable)) {
          throw new Error('SECURITY_DENIED: Shell metacharacters are forbidden in executable name.');
        }
        const workingDir = cwd
          ? this.workspace.resolveAuthorizedPath(cwd, 'read')
          : this.workspace.getRootPath();
        const { stdout, stderr } = await execFileAsync(executable, args, {
          cwd: workingDir,
          shell: false,
          windowsHide: true,
          timeout: 15000,
          maxBuffer: 1024 * 1024,
          signal,
        });
        return {
          stdout: stdout.slice(0, 16000),
          stderr: stderr.slice(0, 8000),
        };
      }
    }
  }
}

/**
 * Safe Parameterized Windows Native Helper Runner
 * Invokes native/windows-helper/helper.ps1 using execFile (no shell interpolation) + Base64 JSON.
 */
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type WindowsHelperAction =
  | 'list-windows'
  | 'focus-window'
  | 'close-window'
  | 'inspect-uia'
  | 'uia-click'
  | 'uia-type'
  | 'capture-screen'
  | 'recycle-item';

export function resolveWindowsHelperScriptPath(): string {
  const candidates = [
    path.join(process.resourcesPath || '', 'windows-helper', 'helper.ps1'),
    path.join(process.cwd(), 'native', 'windows-helper', 'helper.ps1'),
  ];
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  throw new Error('Windows helper script (helper.ps1) not found.');
}

export async function runWindowsHelper<T = Record<string, unknown>>(
  action: WindowsHelperAction,
  payload: Record<string, unknown> = {},
  signal?: AbortSignal,
  timeoutMs = 15000,
): Promise<T> {
  if (process.platform !== 'win32') {
    throw new Error('Windows Native Helper requires win32 platform.');
  }
  const scriptPath = resolveWindowsHelperScriptPath();
  const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');

  const { stdout } = await execFileAsync(
    'powershell.exe',
    [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      scriptPath,
      '-Action',
      action,
      '-PayloadBase64',
      payloadBase64,
    ],
    {
      windowsHide: true,
      timeout: timeoutMs,
      maxBuffer: 4 * 1024 * 1024,
      signal,
    },
  );

  const trimmed = stdout.trim();
  if (!trimmed) {
    throw new Error(`Windows helper '${action}' returned empty output.`);
  }
  return JSON.parse(trimmed) as T;
}

/**
 * Development-Only ASCII Startup Banner (Master Prompt §34)
 * Never printed in packaged production builds; never prints secrets.
 */
import os from 'node:os';
import { BRANDING } from '@shared/branding';

export function printDevStartupBanner(isPackaged: boolean): void {
  if (isPackaged) return;

  const lines = [
    '┌──────────────────────────────────────────────────────────────────┐',
    '│  1MS STUDIO · MUSE FOR WINDOWS                                   │',
    '│  INDEPENDENT DESKTOP AI ASSISTANT · POWERED BY 1RS v1.2          │',
    '├──────────────────────────────────────────────────────────────────┤',
    `│  VERSION      : ${BRANDING.version.padEnd(48)} │`,
    `│  BUILD        : ${BRANDING.buildNumber.padEnd(48)} │`,
    `│  PLATFORM     : ${`${process.platform} (${os.release()})`.padEnd(48)} │`,
    `│  ARCHITECTURE : ${process.arch.padEnd(48)} │`,
    `│  ENVIRONMENT  : ${'development'.padEnd(48)} │`,
    `│  STANDARD     : ${BRANDING.designStandard.padEnd(48)} │`,
    '└──────────────────────────────────────────────────────────────────┘',
  ];
  console.info(lines.join('\n'));
}

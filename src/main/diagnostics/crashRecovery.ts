/**
 * Clean Session Sentinel & Unexpected Crash Recovery Tracker
 */
import fs from 'node:fs';
import path from 'node:path';

interface SessionSentinel {
  pid: number;
  startedAt: string;
  cleanExit: boolean;
  crashReason?: string;
}

export class CrashRecoveryTracker {
  private readonly sentinelPath: string;
  private previousCrashDetected = false;
  private lastCrashDetails: string | null = null;

  constructor(userDataDir: string) {
    this.sentinelPath = path.join(userDataDir, 'session-sentinel.json');
    this.inspectAndAcquire();
  }

  private inspectAndAcquire(): void {
    try {
      if (fs.existsSync(this.sentinelPath)) {
        const prev = JSON.parse(fs.readFileSync(this.sentinelPath, 'utf8')) as SessionSentinel;
        if (!prev.cleanExit) {
          this.previousCrashDetected = true;
          this.lastCrashDetails =
            prev.crashReason || `Unclean exit from session started at ${prev.startedAt} (PID ${prev.pid})`;
        }
      }
    } catch {
      // Corrupted sentinel treated safely
    }

    this.writeSentinel({
      pid: process.pid,
      startedAt: new Date().toISOString(),
      cleanExit: false,
    });
  }

  private writeSentinel(data: SessionSentinel): void {
    try {
      fs.mkdirSync(path.dirname(this.sentinelPath), { recursive: true });
      fs.writeFileSync(this.sentinelPath, JSON.stringify(data, null, 2), 'utf8');
    } catch {
      // Ignore write failures during shutdown
    }
  }

  public recordCrashReason(reason: string): void {
    this.lastCrashDetails = reason;
    this.writeSentinel({
      pid: process.pid,
      startedAt: new Date().toISOString(),
      cleanExit: false,
      crashReason: reason,
    });
  }

  public markCleanExit(): void {
    this.writeSentinel({
      pid: process.pid,
      startedAt: new Date().toISOString(),
      cleanExit: true,
    });
  }

  public clearCrashBanner(): void {
    this.previousCrashDetected = false;
    this.lastCrashDetails = null;
  }

  public getStatus(): { previousCrashDetected: boolean; lastCrashDetails: string | null } {
    return {
      previousCrashDetected: this.previousCrashDetected,
      lastCrashDetails: this.lastCrashDetails,
    };
  }
}

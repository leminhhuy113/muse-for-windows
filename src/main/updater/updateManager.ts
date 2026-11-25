/**
 * Secure Update Manager (electron-updater + GitHub Releases + Code-Signing Safety Gate)
 * Queries leminhhuy113/muse-for-windows releases. When running an unsigned open-source build
 * or Portable build, automatic silent binary installation is disabled by security policy
 * and users receive verified release metadata + direct GitHub Releases manual download.
 */
import { app } from 'electron';
import electronUpdater from 'electron-updater';
import { BRANDING, type ReleaseChannel } from '@shared/branding';
import type { UpdateStateSnapshot } from '@shared/types';

const { autoUpdater } = electronUpdater;

export class UpdateManager {
  private state: UpdateStateSnapshot;
  private readonly onStateChange?: (state: UpdateStateSnapshot) => void;

  constructor(opts: {
    channel: ReleaseChannel;
    isSignedBuild: boolean;
    onStateChange?: (state: UpdateStateSnapshot) => void;
  }) {
    const isPortable = Boolean(process.env.PORTABLE_EXECUTABLE_FILE);
    const autoInstallSupported = app.isPackaged && opts.isSignedBuild && !isPortable;

    this.onStateChange = opts.onStateChange;
    this.state = {
      status: 'idle',
      currentVersion: BRANDING.version,
      latestVersion: null,
      releaseNotes: null,
      releaseUrl: BRANDING.releasesUrl,
      downloadPercent: 0,
      isSignedBuild: opts.isSignedBuild,
      autoInstallSupported,
      channel: opts.channel,
      checkedAt: null,
      errorMessage: null,
    };

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.allowPrerelease = opts.channel !== 'stable';

    autoUpdater.on('checking-for-update', () => {
      this.patchState({ status: 'checking', errorMessage: null });
    });

    autoUpdater.on('update-available', (info) => {
      this.patchState({
        status: 'available',
        latestVersion: info.version,
        releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : null,
        checkedAt: new Date().toISOString(),
      });
      if (this.state.autoInstallSupported) {
        void autoUpdater.downloadUpdate();
      }
    });

    autoUpdater.on('update-not-available', (info) => {
      this.patchState({
        status: 'not-available',
        latestVersion: info.version || BRANDING.version,
        checkedAt: new Date().toISOString(),
      });
    });

    autoUpdater.on('download-progress', (prog) => {
      this.patchState({
        status: 'downloading',
        downloadPercent: Math.round(prog.percent),
      });
    });

    autoUpdater.on('update-downloaded', () => {
      this.patchState({
        status: 'downloaded',
        downloadPercent: 100,
      });
    });

    autoUpdater.on('error', (err) => {
      this.patchState({
        status: 'error',
        checkedAt: new Date().toISOString(),
        errorMessage: err.message,
      });
    });
  }

  private patchState(patch: Partial<UpdateStateSnapshot>): void {
    this.state = { ...this.state, ...patch };
    this.onStateChange?.(this.getState());
  }

  public getState(): UpdateStateSnapshot {
    return { ...this.state };
  }

  public setChannel(channel: ReleaseChannel): void {
    autoUpdater.allowPrerelease = channel !== 'stable';
    this.patchState({ channel });
  }

  public async checkForUpdates(): Promise<UpdateStateSnapshot> {
    this.patchState({ status: 'checking', errorMessage: null });
    try {
      // Query GitHub Releases REST API directly first so unsigned & dev builds get accurate release metadata!
      const res = await fetch(
        'https://api.github.com/repos/leminhhuy113/muse-for-windows/releases?per_page=5',
        {
          headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': `Muse-for-Windows/${BRANDING.version}`,
          },
          signal: AbortSignal.timeout(10000),
        },
      );

      if (res.status === 404) {
        this.patchState({
          status: 'not-available',
          latestVersion: BRANDING.version,
          checkedAt: new Date().toISOString(),
          errorMessage: null,
        });
        return this.getState();
      }

      if (res.ok) {
        const releases = (await res.json()) as Array<{
          tag_name: string;
          prerelease: boolean;
          html_url: string;
          body?: string;
        }>;
        const candidate = releases.find((r) =>
          this.state.channel === 'stable' ? !r.prerelease : true,
        );
        if (candidate) {
          const cleanTag = candidate.tag_name.replace(/^v/i, '');
          const isNewer = cleanTag !== BRANDING.version && cleanTag.localeCompare(BRANDING.version, undefined, { numeric: true }) > 0;
          this.patchState({
            status: isNewer ? 'available' : 'not-available',
            latestVersion: cleanTag,
            releaseUrl: candidate.html_url || BRANDING.releasesUrl,
            releaseNotes: candidate.body || null,
            checkedAt: new Date().toISOString(),
          });
          if (isNewer && this.state.autoInstallSupported) {
            await autoUpdater.checkForUpdates();
          }
          return this.getState();
        }
      }

      this.patchState({
        status: 'not-available',
        latestVersion: BRANDING.version,
        checkedAt: new Date().toISOString(),
      });
      return this.getState();
    } catch (err) {
      this.patchState({
        status: 'error',
        checkedAt: new Date().toISOString(),
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      return this.getState();
    }
  }

  public quitAndInstall(): void {
    if (!this.state.autoInstallSupported) {
      throw new Error(
        'Automatic installation is disabled for unsigned or portable builds. Download the verified installer from GitHub Releases.',
      );
    }
    autoUpdater.quitAndInstall();
  }
}

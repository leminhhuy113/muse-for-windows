#!/usr/bin/env node
/**
 * Prepares electron-builder's winCodeSign-2.6.0 cache on non-Admin Windows hosts
 * where Developer Mode symlink privilege is disabled (skipping unused macOS darwin/*.dylib symlinks).
 * Preserves full Windows rcedit icon & PE metadata stamping without requiring elevation.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

if (process.platform !== 'win32') process.exit(0);

const cacheBase = path.join(
  process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'),
  'electron-builder',
  'Cache',
  'winCodeSign',
);
const targetDir = path.join(cacheBase, 'winCodeSign-2.6.0');
const rceditExe = path.join(targetDir, 'rcedit-x64.exe');

if (fs.existsSync(rceditExe)) {
  process.exit(0);
}

fs.mkdirSync(cacheBase, { recursive: true });
const archiveUrl =
  'https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z';
const archivePath = path.join(cacheBase, 'winCodeSign-2.6.0.7z');

const res = await fetch(archiveUrl);
if (!res.ok) {
  throw new Error(`Failed to download winCodeSign-2.6.0.7z: HTTP ${res.status}`);
}
fs.writeFileSync(archivePath, Buffer.from(await res.arrayBuffer()));

const sevenZip = path.join(process.cwd(), 'node_modules', '7zip-bin', 'win', 'x64', '7za.exe');
execFileSync(sevenZip, ['x', '-bd', '-y', '-xr!darwin', archivePath, `-o${targetDir}`], {
  stdio: 'inherit',
});
fs.rmSync(archivePath, { force: true });
console.log(`[Build] Prepared winCodeSign-2.6.0 cache cleanly at ${targetDir}`);

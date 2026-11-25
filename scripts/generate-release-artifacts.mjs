#!/usr/bin/env node
/**
 * Release Artifact Metadata Generator — 1MS Studio (1RS v1.2)
 * Generates:
 * 1. docs/assets/github-social-preview.png (1280x640, rendered with Playwright + Play font + #FAFF69)
 * 2. dist/SHA256SUMS.txt (for all generated .exe, .blockmap, .yml, .zip artifacts)
 * 3. dist/SBOM.cdx.json (CycloneDX 1.5 Software Bill of Materials from package-lock.json)
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist');
const DOCS_ASSETS_DIR = path.join(ROOT, 'docs', 'assets');

fs.mkdirSync(DIST_DIR, { recursive: true });
fs.mkdirSync(DOCS_ASSETS_DIR, { recursive: true });

async function generateSocialPreview() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const outPng = path.join(DOCS_ASSETS_DIR, 'github-social-preview.png');

  const manropeLatin = path
    .join(
      ROOT,
      'node_modules',
      '@fontsource-variable',
      'manrope',
      'files',
      'manrope-latin-wght-normal.woff2',
    )
    .replace(/\\/g, '/');
  const manropeVi = path
    .join(
      ROOT,
      'node_modules',
      '@fontsource-variable',
      'manrope',
      'files',
      'manrope-vietnamese-wght-normal.woff2',
    )
    .replace(/\\/g, '/');

  const darkShotPath = path
    .join(ROOT, 'docs', 'assets', 'screenshots', 'agent-activity-inspector.png')
    .replace(/\\/g, '/');
  const lightShotPath = path
    .join(ROOT, 'docs', 'assets', 'screenshots', 'theme-light.png')
    .replace(/\\/g, '/');

  /* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<style>
  @font-face {
    font-family: 'Manrope';
    font-style: normal;
    font-weight: 200 800;
    src: url('file:///${manropeVi}') format('woff2');
    unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
  }
  @font-face {
    font-family: 'Manrope';
    font-style: normal;
    font-weight: 200 800;
    src: url('file:///${manropeLatin}') format('woff2');
  }
  :root {
    --bg-canvas: #151A14;
    --bg-surface: #1F271D;
    --bg-elevated: #283224;
    --bg-cream: #F5FBE9;
    --accent-lime: #C7F34B;
    --ink-primary: #F4F9ED;
    --ink-secondary: #CBD5C1;
    --ink-muted: #97A68B;
    --ink-dark: #151A14;
    --border-line: rgba(244, 249, 237, 0.11);
    --border-strong: rgba(199, 243, 75, 0.34);
    --font-display: 'Manrope', 'Segoe UI', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1280px;
    height: 640px;
    overflow: hidden;
    background: var(--bg-canvas);
    color: var(--ink-primary);
    font-family: var(--font-display);
    -webkit-font-smoothing: antialiased;
  }
  .stage {
    position: relative;
    width: 1280px;
    height: 640px;
    display: grid;
    grid-template-columns: 548px 1fr;
    align-items: center;
    padding: 54px 62px;
    isolation: isolate;
  }
  /* Botanical studio ambient light sculptures */
  .glow-lime {
    position: absolute;
    width: 680px;
    height: 680px;
    right: -120px;
    top: -180px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(199, 243, 75, 0.17) 0%, rgba(199, 243, 75, 0.04) 42%, transparent 70%);
    z-index: -2;
  }
  .glow-warm {
    position: absolute;
    width: 560px;
    height: 560px;
    left: -140px;
    bottom: -220px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245, 251, 233, 0.07) 0%, transparent 68%);
    z-index: -2;
  }
  .frame-ring {
    position: absolute;
    inset: 18px;
    border-radius: 28px;
    border: 1px solid var(--border-line);
    pointer-events: none;
    z-index: 1;
  }

  /* Left Editorial Column (1ms-studio.com DNA) */
  .editorial {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    padding: 12px 10px 10px 6px;
  }
  .brand-row {
    display: inline-flex;
    align-items: center;
    gap: 14px;
  }
  .wordmark {
    position: relative;
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.085em;
    line-height: 1;
    color: var(--ink-primary);
  }
  .wordmark::after {
    content: '';
    position: absolute;
    top: 1px;
    right: -9px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-lime);
  }
  .brand-divider {
    width: 1px;
    height: 18px;
    background: var(--border-line);
    margin-left: 6px;
  }
  .studio-tag {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }

  .hero-copy {
    margin-top: 6px;
  }
  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 13px;
    border-radius: 999px;
    background: var(--bg-surface);
    border: 1px solid var(--border-line);
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--accent-lime);
    margin-bottom: 20px;
  }
  .kicker-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent-lime);
    box-shadow: 0 0 10px var(--accent-lime);
  }
  h1 {
    font-size: 66px;
    font-weight: 800;
    font-style: normal;
    letter-spacing: -0.048em;
    line-height: 1.03;
    color: var(--ink-primary);
    margin-bottom: 20px;
  }
  .lime-slab {
    display: inline-block;
    margin-top: 4px;
    padding: 2px 18px 8px;
    border-radius: 20px;
    background: var(--accent-lime);
    color: var(--ink-dark);
  }
  .lead {
    font-size: 17.5px;
    font-weight: 500;
    line-height: 1.52;
    letter-spacing: -0.01em;
    color: var(--ink-secondary);
    max-width: 472px;
  }

  .pills-footer {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 33px;
    padding: 0 14px;
    border-radius: 999px;
    background: var(--bg-surface);
    border: 1px solid var(--border-line);
    font-size: 12px;
    font-weight: 700;
    color: var(--ink-primary);
  }
  .pill.is-cream {
    background: var(--bg-cream);
    color: var(--ink-dark);
    border-color: transparent;
  }
  .repo-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-muted);
  }
  .repo-meta strong {
    color: var(--ink-primary);
    font-weight: 700;
  }

  /* Right Showcase Stage: Real Layered Dark + Light Product Screenshots */
  .showcase {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  figure.shot-back {
    position: absolute;
    right: -8px;
    top: 6px;
    width: 536px;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(21, 26, 20, 0.18);
    box-shadow: 0 30px 70px -20px rgba(0, 0, 0, 0.72);
    transform: rotate(1.5deg);
    opacity: 0.95;
    z-index: 2;
  }
  figure.shot-back img,
  figure.shot-front img {
    display: block;
    width: 100%;
    height: auto;
  }
  figure.shot-front {
    position: relative;
    right: 28px;
    top: 34px;
    width: 592px;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(244, 249, 237, 0.18);
    box-shadow:
      0 42px 95px -18px rgba(0, 0, 0, 0.88),
      0 0 0 1px rgba(199, 243, 75, 0.16);
    z-index: 5;
  }

  /* Floating Live Tray Icon Callout Card */
  .tray-callout {
    position: absolute;
    right: 10px;
    bottom: 6px;
    z-index: 9;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px 12px 13px;
    border-radius: 18px;
    background: rgba(31, 39, 29, 0.94);
    border: 1px solid var(--border-strong);
    box-shadow: 0 22px 48px -12px rgba(0, 0, 0, 0.85);
  }
  .tray-icon-preview {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: var(--bg-canvas);
    border: 1px solid rgba(199, 243, 75, 0.35);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 5px;
  }
  .tray-bar {
    width: 26px;
    height: 4px;
    border-radius: 99px;
    background: #2D3829;
    overflow: hidden;
  }
  .tray-bar-fill {
    width: 45%;
    height: 100%;
    border-radius: 99px;
    background: var(--accent-lime);
  }
  .tray-text b {
    display: block;
    font-size: 12.5px;
    font-weight: 800;
    color: var(--ink-primary);
  }
  .tray-text span {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--accent-lime);
  }
</style>
</head>
<body>
  <div class="stage">
    <div class="glow-lime"></div>
    <div class="glow-warm"></div>
    <div class="frame-ring"></div>

    <div class="editorial">
      <div class="brand-row">
        <span class="wordmark">1ms</span>
        <span class="brand-divider"></span>
        <span class="studio-tag">One Millisecond Studio · 1RS v1.2</span>
      </div>

      <div class="hero-copy">
        <div class="kicker">
          <span class="kicker-dot"></span>
          <span>NATIVE WINDOWS 10 &amp; 11 AI WORKSTATION · v${pkg.version}</span>
        </div>
        <h1>
          Muse<br/>
          <span class="lime-slab">for Windows.</span>
        </h1>
        <p class="lead">
          Seamless official Muse workspace paired with live Quota Usage telemetry in the System Tray &amp; status bar, a 10 GB sandboxed file vault, and 34 permission-gated Windows tools.
        </p>
      </div>

      <div class="pills-footer">
        <div class="pills">
          <span class="pill is-cream">Windows x64 &amp; ARM64</span>
          <span class="pill">Live Quota · Tray &amp; Bar</span>
          <span class="pill">Tiếng Việt · EN · 中文 · 日本語 · 한국어</span>
        </div>
        <div class="repo-meta">
          <strong>MIT Open Source</strong>
          <span>·</span>
          <span>github.com/leminhhuy113/muse-for-windows</span>
        </div>
      </div>
    </div>

    <div class="showcase">
      <figure class="shot-back">
        <img src="file:///${lightShotPath}" alt="Light Theme Local Bridge" />
      </figure>
      <figure class="shot-front">
        <img src="file:///${darkShotPath}" alt="Dark Theme Muse Workstation & Live Quota Popover" />
      </figure>
      <div class="tray-callout">
        <div class="tray-icon-preview">
          <svg width="20" height="16" viewBox="0 0 24 18" fill="none">
            <path d="M3 15V3L12 11.5L21 3V15" stroke="#C7F34B" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="tray-bar"><div class="tray-bar-fill"></div></div>
        </div>
        <div class="tray-text">
          <b>System Tray &amp; Bottom-Left Quota</b>
          <span>Free plan · 45% used · 1B left</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const channels = ['msedge', 'chrome', undefined];
  let browser = null;
  for (const channel of channels) {
    try {
      browser = await chromium.launch({ channel, headless: true });
      break;
    } catch {
      // Try next channel
    }
  }
  if (!browser) throw new Error('No Chromium/Edge browser found to render social preview');
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 640 },
      deviceScaleFactor: 2,
    });
    const tmpHtml = path.join(DIST_DIR, '_social_preview.tmp.html');
    fs.writeFileSync(tmpHtml, html, 'utf8');
    await page.goto(`file:///${tmpHtml.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: outPng });
    fs.rmSync(tmpHtml, { force: true });
    console.log(`[Release] Generated 2560x1280 @2x hero banner -> ${outPng}`);
  } finally {
    await browser.close();
  }
}

function generateSbom() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));
  const components = [];

  for (const [pkgPath, meta] of Object.entries(lock.packages || {})) {
    if (!pkgPath || !pkgPath.startsWith('node_modules/')) continue;
    const info = meta;
    const name = pkgPath.replace(/^node_modules\//, '');
    if (name.includes('node_modules/')) continue; // Top-level resolved packages
    components.push({
      type: 'library',
      name,
      version: info.version || '0.0.0',
      licenses: info.license ? [{ license: { id: String(info.license) } }] : [],
      purl: `pkg:npm/${encodeURIComponent(name)}@${info.version || '0.0.0'}`,
    });
  }

  const sbom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    serialNumber: `urn:uuid:${crypto.randomUUID()}`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      component: {
        type: 'application',
        name: pkg.name,
        version: pkg.version,
        publisher: '1MS Studio',
        licenses: [{ license: { id: 'MIT' } }],
      },
    },
    components,
  };

  const sbomPath = path.join(DIST_DIR, 'SBOM.cdx.json');
  fs.writeFileSync(sbomPath, JSON.stringify(sbom, null, 2), 'utf8');
  console.log(`[Release] Generated SBOM with ${components.length} components -> ${sbomPath}`);
}

function generateChecksums() {
  if (!fs.existsSync(DIST_DIR)) return;
  const allowedExts = new Set(['.exe', '.blockmap', '.json', '.zip']);
  const files = fs
    .readdirSync(DIST_DIR)
    .filter((f) => {
      if (f === 'SHA256SUMS.txt' || f.startsWith('__uninstaller')) return false;
      if (f === 'latest.yml') return true;
      return allowedExts.has(path.extname(f).toLowerCase());
    })
    .sort();

  const lines = files.map((fileName) => {
    const full = path.join(DIST_DIR, fileName);
    const hash = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
    return `${hash}  ${fileName}`;
  });

  const outSums = path.join(DIST_DIR, 'SHA256SUMS.txt');
  fs.writeFileSync(outSums, lines.join('\n') + (lines.length ? '\n' : ''), 'utf8');
  // Copy SHA256SUMS.txt to root as well for convenience
  fs.copyFileSync(outSums, path.join(ROOT, 'SHA256SUMS.txt'));
  console.log(`[Release] Generated SHA256SUMS.txt (${lines.length} artifacts)`);
}

await generateSocialPreview();
generateSbom();
generateChecksums();

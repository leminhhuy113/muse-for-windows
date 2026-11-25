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
  const playWoffPath = path
    .join(ROOT, 'node_modules', '@fontsource', 'play', 'files', 'play-latin-700-normal.woff2')
    .replace(/\\/g, '/');
  const playRegPath = path
    .join(ROOT, 'node_modules', '@fontsource', 'play', 'files', 'play-latin-400-normal.woff2')
    .replace(/\\/g, '/');

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  @font-face { font-family: 'Play'; font-weight: 400; src: url('file:///${playRegPath}') format('woff2'); }
  @font-face { font-family: 'Play'; font-weight: 700; src: url('file:///${playWoffPath}') format('woff2'); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1280px; height: 640px; overflow: hidden;
    background: #0B0D10; color: #F5F7FA; font-family: 'Play', 'Segoe UI', sans-serif;
    display: flex; align-items: center; justify-content: space-between; padding: 68px 76px;
    position: relative;
  }
  .grid-bg {
    position: absolute; inset: 0;
    background-image: linear-gradient(to right, #181C24 1px, transparent 1px),
                      linear-gradient(to bottom, #181C24 1px, transparent 1px);
    background-size: 64px 64px; opacity: 0.45; z-index: 0;
  }
  .left { position: relative; z-index: 2; max-width: 650px; }
  .pill {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 7px 14px; border-radius: 999px;
    background: rgba(250,255,105,0.12); border: 1px solid rgba(250,255,105,0.4);
    color: #FAFF69; font-size: 13px; font-weight: 700; letter-spacing: 0.06em;
    margin-bottom: 24px;
  }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #FAFF69; }
  h1 { font-size: 60px; font-weight: 700; line-height: 1.12; margin-bottom: 18px; }
  h1 span { color: #FAFF69; }
  p { font-size: 21px; line-height: 1.48; color: #949BA8; margin-bottom: 32px; }
  .chips { display: flex; flex-wrap: wrap; gap: 10px; }
  .chip {
    padding: 8px 14px; border-radius: 8px; background: #12151A; border: 1px solid #282D36;
    font-size: 14px; font-weight: 700; color: #F5F7FA;
  }
  .right {
    position: relative; z-index: 2;
    width: 410px; height: 460px; border-radius: 20px;
    background: #12151A; border: 1px solid #282D36;
    padding: 28px; display: flex; flex-direction: column; justify-content: space-between;
    box-shadow: 0 32px 64px rgba(0,0,0,0.65);
  }
  .card-row {
    padding: 14px 16px; border-radius: 10px; background: #0B0D10; border: 1px solid #282D36;
    display: flex; align-items: center; justify-content: space-between; font-size: 14px;
  }
  .ok { color: #34D399; font-weight: 700; font-size: 12px; }
</style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="left">
    <div class="pill"><span class="dot"></span>1MS STUDIO · POWERED BY 1RS v1.2 · MIT OPEN SOURCE</div>
    <h1>Muse <span>for Windows</span></h1>
    <p>Independent native-grade Windows 10 &amp; 11 desktop client for Muse — isolated WebContentsView, Global Quick Assistant, Sandboxed Workspace, and Default-Deny Permission Center.</p>
    <div class="chips">
      <span class="chip">Windows 10 &amp; 11 (x64 / ARM64)</span>
      <span class="chip">VI · EN · 中文 · 日本語 · 한국어</span>
      <span class="chip">Lucian UX/UI</span>
    </div>
  </div>
  <div class="right">
    <div style="display:flex;align-items:center;gap:16px;">
      <svg width="72" height="72" viewBox="0 0 512 512" fill="none">
        <rect x="24" y="24" width="464" height="464" rx="112" fill="#0B0D10" stroke="#282D36" stroke-width="14"/>
        <path d="M128 368V152L256 276L384 152V368" stroke="#FAFF69" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="384" cy="140" r="30" fill="#FAFF69"/>
      </svg>
      <div>
        <div style="font-size:20px;font-weight:700;">Muse v${pkg.version}</div>
        <div style="font-size:13px;color:#949BA8;">Developed by 1MS Studio</div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div class="card-row"><span>Isolated Official Muse Session</span><span class="ok">SANDBOXED</span></div>
      <div class="card-row"><span>10 GB Local Workspace Guard</span><span class="ok">JUNCTION SAFE</span></div>
      <div class="card-row"><span>34-Tool Local Agent Bridge</span><span class="ok">DEFAULT-DENY</span></div>
      <div class="card-row"><span>DPAPI Encrypted Secret Store</span><span class="ok">VERIFIED</span></div>
    </div>
    <div style="font-size:12px;color:#858D9C;display:flex;justify-content:space-between;">
      <span>github.com/leminhhuy113/muse-for-windows</span>
      <span style="color:#FAFF69;font-weight:700;">1RS v1.2</span>
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
    const page = await browser.newPage({ viewport: { width: 1280, height: 640 } });
    const tmpHtml = path.join(DIST_DIR, '_social_preview.tmp.html');
    fs.writeFileSync(tmpHtml, html, 'utf8');
    await page.goto(`file:///${tmpHtml.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: outPng });
    fs.rmSync(tmpHtml, { force: true });
    console.log(`[Release] Generated ${outPng}`);
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

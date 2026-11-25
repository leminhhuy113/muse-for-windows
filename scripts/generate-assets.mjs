#!/usr/bin/env node
/**
 * 1MS Studio — Original Brand Asset Generator (1RS v1.2)
 * Generates editable SVG master artwork, multi-resolution PNGs (16..1024),
 * and multi-frame Windows ICO files (muse.ico, tray.ico, tray-active.ico).
 * Zero third-party proprietary Muse/Meta assets are used.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const ROOT = process.cwd();
const ICONS_DIR = path.join(ROOT, 'resources', 'icons');
const ASSETS_DIR = path.join(ROOT, 'resources', 'assets');

fs.mkdirSync(ICONS_DIR, { recursive: true });
fs.mkdirSync(ASSETS_DIR, { recursive: true });

const SIZES = [16, 24, 32, 48, 64, 128, 256, 512, 1024];
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];

const svgDark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect x="24" y="24" width="464" height="464" rx="124" fill="#151A14"/>
  <rect x="28" y="28" width="456" height="456" rx="120" stroke="#3B4933" stroke-width="8"/>
  <path d="M128 368V152L256 276L384 152V368" stroke="#C7F34B" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="384" cy="140" r="28" fill="#C7F34B"/>
  <rect x="196" y="356" width="120" height="16" rx="8" fill="#F4F9ED" fill-opacity="0.92"/>
</svg>
`;

const svgLight = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect x="24" y="24" width="464" height="464" rx="124" fill="#F5FBE9"/>
  <rect x="28" y="28" width="456" height="456" rx="120" stroke="#DCE5D2" stroke-width="8"/>
  <path d="M128 368V152L256 276L384 152V368" stroke="#151A14" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="384" cy="140" r="30" fill="#C7F34B"/>
  <rect x="196" y="356" width="120" height="16" rx="8" fill="#416315"/>
</svg>
`;

const svgAbout = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 240" fill="none">
  <rect width="640" height="240" rx="16" fill="#12151A"/>
  <rect x="1" y="1" width="638" height="238" rx="15" stroke="#282D36" stroke-width="2"/>
  <g opacity="0.22" stroke="#282D36" stroke-width="1">
    <line x1="0" y1="60" x2="640" y2="60"/>
    <line x1="0" y1="120" x2="640" y2="120"/>
    <line x1="0" y1="180" x2="640" y2="180"/>
    <line x1="160" y1="0" x2="160" y2="240"/>
    <line x1="320" y1="0" x2="320" y2="240"/>
    <line x1="480" y1="0" x2="480" y2="240"/>
  </g>
  <rect x="44" y="44" width="152" height="152" rx="36" fill="#0B0D10" stroke="#282D36" stroke-width="3"/>
  <path d="M82 162V84L120 124L158 84V162" stroke="#FAFF69" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="158" cy="80" r="10" fill="#FAFF69"/>
  <rect x="232" y="64" width="96" height="24" rx="12" fill="#FAFF69" fill-opacity="0.14" stroke="#FAFF69" stroke-opacity="0.4"/>
  <circle cx="248" cy="76" r="4" fill="#FAFF69"/>
  <rect x="260" y="72" width="54" height="8" rx="4" fill="#FAFF69"/>
  <rect x="232" y="106" width="290" height="20" rx="6" fill="#F5F7FA" fill-opacity="0.92"/>
  <rect x="232" y="138" width="220" height="12" rx="6" fill="#949BA8" fill-opacity="0.55"/>
  <rect x="232" y="162" width="164" height="12" rx="6" fill="#FAFF69" fill-opacity="0.4"/>
</svg>
`;

const svgOnboarding = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 280" fill="none">
  <rect width="720" height="280" rx="16" fill="#0B0D10"/>
  <rect x="1" y="1" width="718" height="278" rx="15" stroke="#282D36" stroke-width="2"/>
  <rect x="36" y="34" width="648" height="212" rx="12" fill="#12151A" stroke="#282D36" stroke-width="1.5"/>
  <rect x="36" y="34" width="648" height="32" rx="12" fill="#1B1F26"/>
  <circle cx="58" cy="50" r="5" fill="#FAFF69"/>
  <rect x="72" y="46" width="88" height="8" rx="4" fill="#F5F7FA" fill-opacity="0.8"/>
  <rect x="52" y="82" width="44" height="148" rx="8" fill="#0B0D10" stroke="#282D36"/>
  <rect x="64" y="96" width="20" height="20" rx="5" fill="#FAFF69"/>
  <rect x="64" y="128" width="20" height="20" rx="5" fill="#20242B"/>
  <rect x="64" y="160" width="20" height="20" rx="5" fill="#20242B"/>
  <rect x="112" y="82" width="364" height="148" rx="8" fill="#0B0D10" stroke="#282D36"/>
  <path d="M254 184V128L294 166L334 128V184" stroke="#FAFF69" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="492" y="82" width="176" height="148" rx="8" fill="#1B1F26" stroke="#282D36"/>
  <rect x="508" y="98" width="112" height="10" rx="5" fill="#FAFF69" fill-opacity="0.85"/>
  <rect x="508" y="120" width="144" height="28" rx="6" fill="#12151A" stroke="#282D36"/>
  <rect x="508" y="158" width="144" height="28" rx="6" fill="#12151A" stroke="#282D36"/>
  <rect x="508" y="196" width="92" height="20" rx="6" fill="#34D399" fill-opacity="0.25"/>
</svg>
`;

fs.writeFileSync(path.join(ICONS_DIR, 'muse-icon-dark.svg'), svgDark);
fs.writeFileSync(path.join(ICONS_DIR, 'muse-icon-light.svg'), svgLight);
fs.writeFileSync(path.join(ASSETS_DIR, 'about-artwork.svg'), svgAbout);
fs.writeFileSync(path.join(ASSETS_DIR, 'onboarding-artwork.svg'), svgOnboarding);

/** Signed distance to a rounded box centered at (cx, cy) with half-extents (hx, hy) and radius r */
function sdRoundRect(px, py, cx, cy, hx, hy, r) {
  const dx = Math.abs(px - cx) - (hx - r);
  const dy = Math.abs(py - cy) - (hy - r);
  const outDist = Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  const inDist = Math.min(Math.max(dx, dy), 0);
  return outDist + inDist - r;
}

/** Signed distance from point P to segment AB */
function sdSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  return Math.hypot(pax - bax * h, pay - bay * h);
}

function mixColor(base, over, alpha) {
  const a = Math.max(0, Math.min(1, alpha));
  const outA = a + base[3] * (1 - a);
  if (outA <= 0) return [0, 0, 0, 0];
  return [
    (over[0] * a + base[0] * base[3] * (1 - a)) / outA,
    (over[1] * a + base[1] * base[3] * (1 - a)) / outA,
    (over[2] * a + base[2] * base[3] * (1 - a)) / outA,
    outA,
  ];
}

/**
 * Renders a crisp antialiased RGBA PNG buffer in normalized 512x512 coordinates.
 */
function renderIconPng(size, { variant = 'dark', activeDot = false } = {}) {
  const png = new PNG({ width: size, height: size });
  const scale = 512 / size;
  const aa = Math.max(1.15, scale * 0.85);

  const bgCol = variant === 'light' ? [245, 251, 233, 1] : [21, 26, 20, 1];
  const borderCol = variant === 'light' ? [220, 229, 210, 1] : [59, 73, 51, 1];
  const mCol = variant === 'light' ? [21, 26, 20, 1] : [199, 243, 75, 1];
  const sparkCol = [199, 243, 75, 1];
  const barCol = variant === 'light' ? [65, 99, 21, 1] : [244, 249, 237, 0.92];
  const activeCol = [152, 213, 164, 1]; // #98D5A4 botanical mint pulse for active tray

  const strokeHalf = size <= 24 ? 30 : 24;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = (x + 0.5) * scale;
      const py = (y + 0.5) * scale;

      let col = [0, 0, 0, 0];

      // 1. Squircle tile
      const dTile = sdRoundRect(px, py, 256, 256, 232, 232, 108);
      const tileAlpha = 1 - Math.max(0, Math.min(1, (dTile + aa * 0.5) / aa));
      if (tileAlpha > 0) {
        col = mixColor(col, bgCol, tileAlpha);

        // Border stroke inside tile
        const dBorder = Math.abs(dTile + 5) - 5;
        const borderAlpha = (1 - Math.max(0, Math.min(1, (dBorder + aa * 0.5) / aa))) * tileAlpha;
        if (borderAlpha > 0) {
          col = mixColor(col, borderCol, borderAlpha);
        }

        // 2. Monogram "M" (4 crisp segments)
        const dM = Math.min(
          sdSegment(px, py, 132, 366, 132, 154),
          sdSegment(px, py, 132, 154, 256, 276),
          sdSegment(px, py, 256, 276, 380, 154),
          sdSegment(px, py, 380, 154, 380, 366),
        ) - strokeHalf;
        const mAlpha = 1 - Math.max(0, Math.min(1, (dM + aa * 0.5) / aa));
        if (mAlpha > 0) {
          col = mixColor(col, mCol, mAlpha);
        }

        // 3. Spark node on top-right apex
        const dSpark = Math.hypot(px - 380, py - 144) - (size <= 24 ? 34 : 29);
        const sparkAlpha = 1 - Math.max(0, Math.min(1, (dSpark + aa * 0.5) / aa));
        if (sparkAlpha > 0) {
          col = mixColor(col, activeDot ? activeCol : sparkCol, sparkAlpha);
        }

        // 4. Subtle baseline bar (only >= 32px so 16x16 stays ultra-clean)
        if (size >= 32) {
          const dBar = sdRoundRect(px, py, 256, 386, 56, 8, 8);
          const barAlpha = 1 - Math.max(0, Math.min(1, (dBar + aa * 0.5) / aa));
          if (barAlpha > 0) {
            col = mixColor(col, barCol, barAlpha);
          }
        }
      }

      const idx = (size * y + x) << 2;
      png.data[idx] = Math.round(col[0]);
      png.data[idx + 1] = Math.round(col[1]);
      png.data[idx + 2] = Math.round(col[2]);
      png.data[idx + 3] = Math.round(col[3] * 255);
    }
  }

  return PNG.sync.write(png);
}

/**
 * Packs an array of { size, buffer } PNGs into a valid Windows Vista+ multi-frame .ico file.
 */
function buildIco(frames) {
  const count = frames.length;
  const headerSize = 6 + count * 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type = 1 (ICO)
  header.writeUInt16LE(count, 4); // Image count

  let offset = headerSize;
  frames.forEach((frame, i) => {
    const entryOffset = 6 + i * 16;
    header.writeUInt8(frame.size >= 256 ? 0 : frame.size, entryOffset); // Width
    header.writeUInt8(frame.size >= 256 ? 0 : frame.size, entryOffset + 1); // Height
    header.writeUInt8(0, entryOffset + 2); // Color palette
    header.writeUInt8(0, entryOffset + 3); // Reserved
    header.writeUInt16LE(1, entryOffset + 4); // Color planes
    header.writeUInt16LE(32, entryOffset + 6); // Bits per pixel
    header.writeUInt32LE(frame.buffer.length, entryOffset + 8); // Image byte length
    header.writeUInt32LE(offset, entryOffset + 12); // Byte offset
    offset += frame.buffer.length;
  });

  return Buffer.concat([header, ...frames.map((f) => f.buffer)]);
}

const darkBuffers = new Map();
for (const size of SIZES) {
  const darkBuf = renderIconPng(size, { variant: 'dark' });
  const lightBuf = renderIconPng(size, { variant: 'light' });
  darkBuffers.set(size, darkBuf);
  fs.writeFileSync(path.join(ICONS_DIR, `icon-${size}x${size}.png`), darkBuf);
  fs.writeFileSync(path.join(ICONS_DIR, `icon-light-${size}x${size}.png`), lightBuf);
}

// Canonical icon.png (512x512)
fs.writeFileSync(path.join(ICONS_DIR, 'icon.png'), darkBuffers.get(512));

// Multi-resolution muse.ico (16..256)
const mainIcoFrames = ICO_SIZES.map((size) => ({ size, buffer: darkBuffers.get(size) }));
fs.writeFileSync(path.join(ICONS_DIR, 'muse.ico'), buildIco(mainIcoFrames));

// System Tray icons (16, 24, 32, 48)
const traySizes = [16, 24, 32, 48];
fs.writeFileSync(
  path.join(ICONS_DIR, 'tray.ico'),
  buildIco(traySizes.map((size) => ({ size, buffer: darkBuffers.get(size) }))),
);
fs.writeFileSync(
  path.join(ICONS_DIR, 'tray-active.ico'),
  buildIco(
    traySizes.map((size) => ({
      size,
      buffer: renderIconPng(size, { variant: 'dark', activeDot: true }),
    })),
  ),
);

console.log(
  `[1MS Assets] Generated SVGs, ${SIZES.length * 2} PNGs (16..1024), muse.ico, tray.ico, and tray-active.ico.`,
);

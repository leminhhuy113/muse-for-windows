/**
 * Pure TypeScript 32×32 RGBA PNG Generator for Windows System Tray Icon
 * Renders the 1MS Studio `M` emblem + a live color-coded Quota Usage gauge bar
 * with zero native binary dependencies (uses built-in node:zlib).
 */
import zlib from 'node:zlib';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

type Rgba = [number, number, number, number];

function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function roundedRectSdf(
  px: number,
  py: number,
  cx: number,
  cy: number,
  halfW: number,
  halfH: number,
  r: number,
): number {
  const qx = Math.abs(px - cx) - (halfW - r);
  const qy = Math.abs(py - cy) - (halfH - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

function blendPixel(buf: Uint8Array, idx: number, color: Rgba, alphaScale = 1): void {
  const sa = (color[3] / 255) * Math.max(0, Math.min(1, alphaScale));
  if (sa <= 0) return;
  const da = buf[idx + 3] / 255;
  const outA = sa + da * (1 - sa);
  if (outA <= 0) return;
  buf[idx] = Math.round((color[0] * sa + buf[idx] * da * (1 - sa)) / outA);
  buf[idx + 1] = Math.round((color[1] * sa + buf[idx + 1] * da * (1 - sa)) / outA);
  buf[idx + 2] = Math.round((color[2] * sa + buf[idx + 2] * da * (1 - sa)) / outA);
  buf[idx + 3] = Math.round(outA * 255);
}

export function resolveQuotaToneRgb(percentUsed: number | null): Rgba {
  if (percentUsed === null) return [199, 243, 75, 255]; // #C7F34B 1MS Lime
  if (percentUsed >= 90) return [255, 92, 92, 255]; // #FF5C5C Critical Red
  if (percentUsed >= 70) return [245, 185, 66, 255]; // #F5B942 Warning Amber
  return [199, 243, 75, 255]; // #C7F34B Healthy Lime
}

/**
 * Generates a sharp anti-aliased 32×32 PNG Buffer for Electron `nativeImage.createFromBuffer`.
 */
export function createQuotaTrayPngBuffer(
  percentUsed: number | null,
  agentActive = false,
): Buffer {
  const W = 32;
  const H = 32;
  const pixels = new Uint8Array(W * H * 4);

  const bg: Rgba = [21, 26, 20, 255]; // #151A14 Botanical Dark
  const border: Rgba = agentActive ? [127, 227, 245, 255] : [69, 86, 60, 255];
  const glyphColor: Rgba = agentActive
    ? [127, 227, 245, 255]
    : resolveQuotaToneRgb(percentUsed);
  const trackBg: Rgba = [45, 56, 41, 255];

  // 1. Rounded squircle card + border
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const idx = (y * W + x) * 4;
      const d = roundedRectSdf(x + 0.5, y + 0.5, 16, 16, 14.5, 14.5, 7);
      if (d < 0.7) {
        const fillCov = Math.max(0, Math.min(1, 0.5 - d));
        blendPixel(pixels, idx, bg, fillCov);
        const borderDist = Math.abs(d + 0.6);
        if (borderDist < 1.1) {
          blendPixel(pixels, idx, border, Math.max(0, 1 - borderDist / 1.1) * fillCov);
        }
      }
    }
  }

  // 2. Signature 1MS `M` monogram + dot (shifted slightly upward when quota bar shown)
  const hasBar = percentUsed !== null;
  const topY = hasBar ? 6.5 : 8.5;
  const botY = hasBar ? 19.5 : 22.5;
  const midY = hasBar ? 14.2 : 16.5;

  const segments: Array<[number, number, number, number]> = [
    [8.5, botY, 8.5, topY],
    [8.5, topY, 16.0, midY],
    [16.0, midY, 23.5, topY],
    [23.5, topY, 23.5, botY],
  ];

  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const idx = (y * W + x) * 4;
      let minD = 99;
      for (const [x1, y1, x2, y2] of segments) {
        minD = Math.min(minD, distToSegment(x + 0.5, y + 0.5, x1, y1, x2, y2));
      }
      const strokeRadius = 1.65;
      if (minD < strokeRadius + 0.7) {
        const cov = Math.max(0, Math.min(1, strokeRadius + 0.5 - minD));
        blendPixel(pixels, idx, glyphColor, cov);
      }
    }
  }

  // 3. Bottom Quota Progress Gauge Bar (x: 6..26, y: 23.5..26.5)
  if (hasBar) {
    const clamped = Math.max(0, Math.min(100, percentUsed));
    const barLeft = 6;
    const barRight = 26;
    const barWidth = barRight - barLeft;
    const fillWidth = clamped > 0 ? Math.max(2.2, (clamped / 100) * barWidth) : 0;
    const fillColor = resolveQuotaToneRgb(clamped);

    for (let y = 22; y <= 28; y += 1) {
      for (let x = 5; x <= 27; x += 1) {
        const idx = (y * W + x) * 4;
        const dTrack = roundedRectSdf(x + 0.5, y + 0.5, 16, 25, barWidth / 2, 1.7, 1.5);
        if (dTrack < 0.6) {
          blendPixel(pixels, idx, trackBg, Math.max(0, Math.min(1, 0.5 - dTrack)));
        }
        if (fillWidth > 0) {
          const cxFill = barLeft + fillWidth / 2;
          const dFill = roundedRectSdf(
            x + 0.5,
            y + 0.5,
            cxFill,
            25,
            fillWidth / 2,
            1.7,
            Math.min(1.5, fillWidth / 2),
          );
          if (dFill < 0.6) {
            blendPixel(pixels, idx, fillColor, Math.max(0, Math.min(1, 0.5 - dFill)));
          }
        }
      }
    }
  }

  // 4. Encode PNG (IHDR + IDAT + IEND)
  const rawScanlines = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y += 1) {
    const rowStart = y * (1 + W * 4);
    rawScanlines[rowStart] = 0; // Filter type 0 (None)
    rawScanlines.set(pixels.subarray(y * W * 4, (y + 1) * W * 4), rowStart + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idatData = zlib.deflateSync(rawScanlines, { level: 6 });

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idatData),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

export function formatAsciiProgressBar(percent: number, slots = 10): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * slots);
  return `${'█'.repeat(filled)}${'░'.repeat(Math.max(0, slots - filled))}`;
}

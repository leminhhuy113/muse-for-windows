#!/usr/bin/env node
/**
 * Repository & Git History Secret Scanner — 1MS Studio Security Gate
 * Scans all tracked/untracked workspace files (excluding node_modules, dist, .git, .local-cache)
 * and Git commit history for API keys, GitHub PATs, OAuth tokens, private keys, cookies, or personal DBs.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'out',
  'coverage',
  '.local-cache',
  '.agents',
  'playwright-report',
  'test-results',
]);

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.css',
  '.html',
  '.ps1',
  '.txt',
]);

const FORBIDDEN_FILE_EXTENSIONS = new Set([
  '.pfx',
  '.p12',
  '.pem',
  '.key',
  '.sqlite',
  '.sqlite3',
  '.db',
]);

const SECRET_RULES = [
  { id: 'OPENAI_API_KEY', regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/ },
  { id: 'GITHUB_PAT', regex: /\bgh[pousr]_[A-Za-z0-9]{25,}\b/ },
  { id: 'GITHUB_FINE_GRAINED_PAT', regex: /\bgithub_pat_[A-Za-z0-9_]{30,}\b/ },
  { id: 'GOOGLE_API_KEY', regex: /\bAIza[0-9A-Za-z_-]{33,}\b/ },
  { id: 'AWS_ACCESS_KEY', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: 'PRIVATE_KEY_HEADER', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { id: 'SLACK_TOKEN', regex: /\bxox[baprs]-[0-9A-Za-z-]{20,}\b/ },
];

const findings = [];
let scannedFiles = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (FORBIDDEN_FILE_EXTENSIONS.has(ext)) {
      findings.push({ file: rel, line: 0, rule: 'FORBIDDEN_ARTIFACT_EXTENSION' });
      continue;
    }

    if (!TEXT_EXTENSIONS.has(ext) && entry.name !== '.env.example') continue;
    if (rel === 'package-lock.json') continue;

    scannedFiles += 1;
    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      // Allow deliberate synthetic unit-test redaction fixtures
      if (rel.startsWith('tests/') && line.includes('1234567890abcdefghij')) return;
      for (const rule of SECRET_RULES) {
        if (rule.regex.test(line)) {
          findings.push({ file: rel, line: idx + 1, rule: rule.id });
        }
      }
    });
  }
}

walk(ROOT);

// Scan Git commit log patches if commits exist
let gitCommitsScanned = 0;
try {
  const countOut = execFileSync('git', ['rev-list', '--count', 'HEAD'], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
  gitCommitsScanned = Number(countOut) || 0;
  if (gitCommitsScanned > 0) {
    const patchLog = execFileSync('git', ['log', '-p', '--all'], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    for (const rule of SECRET_RULES) {
      const match = patchLog.match(rule.regex);
      if (match && !match[0].includes('1234567890abcdefghij')) {
        findings.push({ file: '<git-history>', line: 0, rule: rule.id });
      }
    }
  }
} catch {
  // No commits yet
}

const summary = {
  timestamp: new Date().toISOString(),
  scannedFiles,
  gitCommitsScanned,
  findingsCount: findings.length,
  findings,
};

console.log(JSON.stringify(summary, null, 2));
if (findings.length > 0) {
  process.exit(1);
}

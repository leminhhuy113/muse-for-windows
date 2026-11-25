/**
 * Automatic Secret, Token, Cookie & Credential Redaction Utility
 * Applied before writing to SQLite Audit Logs, Diagnostics reports, or Settings exports.
 */

const SECRET_PATTERNS: Array<{ regex: RegExp; replacement: string }> = [
  { regex: /\b(sk-[a-zA-Z0-9_-]{16,})\b/g, replacement: '[REDACTED_API_KEY]' },
  { regex: /\b(gh[pousr]_[a-zA-Z0-9]{20,})\b/g, replacement: '[REDACTED_GITHUB_TOKEN]' },
  { regex: /\b(AIza[0-9A-Za-z_-]{30,})\b/g, replacement: '[REDACTED_GOOGLE_KEY]' },
  { regex: /Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, replacement: 'Bearer [REDACTED_TOKEN]' },
  {
    regex: /(["']?(?:password|passwd|secret|apiKey|api_key|access_token|refresh_token|cookie|session_token)["']?\s*[:=]\s*["'])([^"']+)(["'])/gi,
    replacement: '$1[REDACTED]$3',
  },
];

export function redactSensitiveText(input: string): string {
  let out = input;
  for (const { regex, replacement } of SECRET_PATTERNS) {
    out = out.replace(regex, replacement);
  }
  return out;
}

export function redactSensitiveObject<T>(value: T): T {
  const serialized = JSON.stringify(value, (key, val) => {
    if (/password|secret|apikey|api_key|token|cookie|authorization/i.test(key)) {
      return '[REDACTED]';
    }
    if (typeof val === 'string') {
      return redactSensitiveText(val);
    }
    return val;
  });
  return JSON.parse(serialized) as T;
}

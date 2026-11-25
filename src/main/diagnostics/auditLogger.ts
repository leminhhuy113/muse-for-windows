/**
 * Searchable Local Activity & Audit Logger (SQLite via node:sqlite with automatic JSONL fallback)
 * Redacts all passwords, cookies, API keys, and tokens before persistence.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { AuditLogEntry, PermissionCategory } from '@shared/types';
import { redactSensitiveText } from '../security/redact';

interface SqliteDbLike {
  exec(sql: string): void;
  prepare(sql: string): {
    run(...params: unknown[]): unknown;
    all(...params: unknown[]): Array<Record<string, unknown>>;
  };
  close(): void;
}

const requireMod = createRequire(import.meta.url);

export class AuditLogger {
  private db: SqliteDbLike | null = null;
  private readonly fallbackJsonPath: string;
  private fallbackEntries: AuditLogEntry[] = [];

  constructor(userDataDir: string) {
    fs.mkdirSync(userDataDir, { recursive: true });
    const sqlitePath = path.join(userDataDir, 'audit_history.sqlite');
    this.fallbackJsonPath = path.join(userDataDir, 'audit_history.fallback.json');

    try {
      const sqliteMod = requireMod('node:sqlite') as {
        DatabaseSync: new (filename: string) => SqliteDbLike;
      };
      this.db = new sqliteMod.DatabaseSync(sqlitePath);
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          timestamp TEXT NOT NULL,
          tool_name TEXT NOT NULL,
          category TEXT NOT NULL,
          requesting_component TEXT NOT NULL,
          requested_scope TEXT NOT NULL,
          approval_decision TEXT NOT NULL,
          execution_result TEXT NOT NULL,
          duration_ms INTEGER NOT NULL,
          error_details TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_audit_category ON audit_logs(category);
      `);
    } catch {
      this.db = null;
      if (fs.existsSync(this.fallbackJsonPath)) {
        try {
          this.fallbackEntries = JSON.parse(fs.readFileSync(this.fallbackJsonPath, 'utf8'));
        } catch {
          this.fallbackEntries = [];
        }
      }
    }
  }

  public record(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const sanitized: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      toolName: entry.toolName,
      category: entry.category,
      requestingComponent: redactSensitiveText(entry.requestingComponent),
      requestedScope: redactSensitiveText(entry.requestedScope).slice(0, 500),
      approvalDecision: entry.approvalDecision,
      executionResult: entry.executionResult,
      durationMs: Math.max(0, Math.round(entry.durationMs)),
      errorDetails: entry.errorDetails
        ? redactSensitiveText(entry.errorDetails).slice(0, 600)
        : null,
    };

    if (this.db) {
      this.db
        .prepare(
          `INSERT INTO audit_logs (
            id, timestamp, tool_name, category, requesting_component,
            requested_scope, approval_decision, execution_result, duration_ms, error_details
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          sanitized.id,
          sanitized.timestamp,
          sanitized.toolName,
          sanitized.category,
          sanitized.requestingComponent,
          sanitized.requestedScope,
          sanitized.approvalDecision,
          sanitized.executionResult,
          sanitized.durationMs,
          sanitized.errorDetails,
        );
    } else {
      this.fallbackEntries.unshift(sanitized);
      this.fallbackEntries = this.fallbackEntries.slice(0, 5000);
      fs.writeFileSync(this.fallbackJsonPath, JSON.stringify(this.fallbackEntries, null, 2), 'utf8');
    }

    return sanitized;
  }

  public query(filters: {
    query?: string;
    category?: PermissionCategory;
    result?: AuditLogEntry['executionResult'];
    sinceIso?: string;
    limit?: number;
  } = {}): AuditLogEntry[] {
    const limit = Math.min(Math.max(filters.limit || 200, 1), 1000);

    if (this.db) {
      const clauses: string[] = [];
      const params: unknown[] = [];

      if (filters.category) {
        clauses.push('category = ?');
        params.push(filters.category);
      }
      if (filters.result) {
        clauses.push('execution_result = ?');
        params.push(filters.result);
      }
      if (filters.sinceIso) {
        clauses.push('timestamp >= ?');
        params.push(filters.sinceIso);
      }
      if (filters.query && filters.query.trim()) {
        clauses.push('(tool_name LIKE ? OR requesting_component LIKE ? OR requested_scope LIKE ?)');
        const like = `%${filters.query.trim()}%`;
        params.push(like, like, like);
      }

      const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
      const rows = this.db
        .prepare(`SELECT * FROM audit_logs ${whereSql} ORDER BY timestamp DESC LIMIT ?`)
        .all(...params, limit);

      return rows.map((r) => ({
        id: String(r.id),
        timestamp: String(r.timestamp),
        toolName: String(r.tool_name),
        category: r.category as PermissionCategory,
        requestingComponent: String(r.requesting_component),
        requestedScope: String(r.requested_scope),
        approvalDecision: String(r.approval_decision),
        executionResult: r.execution_result as AuditLogEntry['executionResult'],
        durationMs: Number(r.duration_ms),
        errorDetails: r.error_details ? String(r.error_details) : null,
      }));
    }

    return this.fallbackEntries
      .filter((e) => {
        if (filters.category && e.category !== filters.category) return false;
        if (filters.result && e.executionResult !== filters.result) return false;
        if (filters.sinceIso && e.timestamp < filters.sinceIso) return false;
        if (filters.query && filters.query.trim()) {
          const q = filters.query.trim().toLowerCase();
          return (
            e.toolName.toLowerCase().includes(q) ||
            e.requestingComponent.toLowerCase().includes(q) ||
            e.requestedScope.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .slice(0, limit);
  }

  public pruneOlderThanDays(days: number): void {
    const cutoff = new Date(Date.now() - days * 86400 * 1000).toISOString();
    if (this.db) {
      this.db.prepare('DELETE FROM audit_logs WHERE timestamp < ?').run(cutoff);
    } else {
      this.fallbackEntries = this.fallbackEntries.filter((e) => e.timestamp >= cutoff);
      fs.writeFileSync(this.fallbackJsonPath, JSON.stringify(this.fallbackEntries, null, 2), 'utf8');
    }
  }

  public exportSanitizedJson(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        product: 'Muse for Windows (1MS Studio)',
        entries: this.query({ limit: 1000 }),
      },
      null,
      2,
    );
  }

  public clearAll(): void {
    if (this.db) {
      this.db.exec('DELETE FROM audit_logs');
    } else {
      this.fallbackEntries = [];
      if (fs.existsSync(this.fallbackJsonPath)) {
        fs.rmSync(this.fallbackJsonPath, { force: true });
      }
    }
  }

  public close(): void {
    this.db?.close();
    this.db = null;
  }
}

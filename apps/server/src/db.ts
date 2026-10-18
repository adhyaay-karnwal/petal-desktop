import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import Database from 'better-sqlite3';
import { DATA_DIR } from './env.ts';

fs.mkdirSync(DATA_DIR, { recursive: true });

/** One SQLite database holds better-auth's tables and the app's tables. */
export const db = new Database(path.join(DATA_DIR, 'petal.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Each route module declares the tables it owns. Statements must be
 * idempotent (CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS).
 */
export function defineSchema(sql: string) {
  db.exec(sql);
}

export const newId = () => crypto.randomUUID();
export const nowIso = () => new Date().toISOString();

export function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string' || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// Core tables shared by every route module. Ownership:
// - project / project_share / project_invite: routes/account.ts
// - project_file: routes/content.ts (the builder reads it)
defineSchema(`
CREATE TABLE IF NOT EXISTS project (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_by_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  edited_at TEXT,
  deleted_at TEXT,
  preview_url TEXT,
  link_token TEXT UNIQUE,
  link_access TEXT NOT NULL DEFAULT 'none',
  allow_duplicate INTEGER NOT NULL DEFAULT 0,
  settings TEXT NOT NULL DEFAULT '{}',
  scan_result TEXT
);
CREATE INDEX IF NOT EXISTS project_org ON project(organization_id);

CREATE TABLE IF NOT EXISTS project_share (
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL DEFAULT 'user',
  target_id TEXT NOT NULL,
  permission TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (project_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS project_invite (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  permission TEXT NOT NULL,
  inviter_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  accepted_at TEXT
);

CREATE TABLE IF NOT EXISTS project_file (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (project_id, path)
);
`);

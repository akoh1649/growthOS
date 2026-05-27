import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "prisma", "dev.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      url TEXT UNIQUE NOT NULL,
      name TEXT,
      user_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      url TEXT NOT NULL,
      score INTEGER,
      issues INTEGER DEFAULT 0,
      issues_json TEXT DEFAULT '[]',
      title TEXT,
      description TEXT,
      headings_json TEXT DEFAULT '[]',
      links_count INTEGER DEFAULT 0,
      images_count INTEGER DEFAULT 0,
      load_time_ms INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (site_id) REFERENCES sites(id)
    );

    CREATE TABLE IF NOT EXISTS agent_tasks (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      agent_type TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (site_id) REFERENCES sites(id)
    );

    CREATE TABLE IF NOT EXISTS content_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      agent_type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      platform TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      published_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT 'global',
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    );
  `);
}
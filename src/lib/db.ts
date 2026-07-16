import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";

// One SQLite file is the app's whole persistent state. In production
// fly.toml points DATABASE_PATH at the machine's volume (/data), which is
// how state survives a reload and a redeploy; locally it defaults to an
// untracked file in .data/.
const path = process.env.DATABASE_PATH ?? "./.data/app.db";
mkdirSync(dirname(path), { recursive: true });

export const db = new Database(path);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export interface Message {
  id: number;
  body: string;
  created_at: string;
}

export function listMessages(): Message[] {
  return db.prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 50").all() as Message[];
}

export function addMessage(body: string): Message {
  const { lastInsertRowid } = db.prepare("INSERT INTO messages (body) VALUES (?)").run(body);
  return db.prepare("SELECT * FROM messages WHERE id = ?").get(lastInsertRowid) as Message;
}

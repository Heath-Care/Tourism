import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// ----------------------------------------------------
// Persistent SQLite database.
//
// This file lives on disk at data/hidden-india.db and is NOT touched by
// `npm run build` or `vite build` — those only compile src/ into dist/.
// Accounts, sessions, favorites, saved itineraries, and Ask-the-Place
// conversations all survive rebuilds and server restarts because they live
// here instead of an in-memory object or the browser's localStorage.
//
// data/ is gitignored — delete data/hidden-india.db if you ever want to
// reset the database to a clean slate.
// ----------------------------------------------------

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'hidden-india.db');
export const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar TEXT,
    role TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS favorites (
    user_id TEXT NOT NULL,
    destination_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (user_id, destination_id)
  );

  CREATE TABLE IF NOT EXISTS itineraries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    destination_id TEXT NOT NULL,
    destination_name TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    destination_id TEXT,
    destination_name TEXT,
    title TEXT,
    messages TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
  CREATE INDEX IF NOT EXISTS idx_itineraries_user ON itineraries(user_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
`);

// ----------------------------------------------------
// Types
// ----------------------------------------------------
export interface DbUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar: string | null;
  role: string | null;
  created_at: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  favoriteDestinationIds: string[];
  savedItineraries: any[];
}

// ----------------------------------------------------
// User queries
// ----------------------------------------------------
export function getUserByEmail(email: string): DbUser | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email.trim().toLowerCase()) as unknown as DbUser | undefined;
}

export function getUserById(id: string): DbUser | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as unknown as DbUser | undefined;
}

export function createUser(params: { name: string; email: string; passwordHash: string; avatar: string; role: string }): DbUser {
  const id = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const createdAt = new Date().toISOString();
  const stmt = db.prepare(
    `INSERT INTO users (id, name, email, password_hash, avatar, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  stmt.run(id, params.name, params.email.trim().toLowerCase(), params.passwordHash, params.avatar, params.role, createdAt);
  return getUserById(id)!;
}

export function updateUser(id: string, patch: Partial<Pick<DbUser, 'name' | 'avatar' | 'role'>>) {
  const existing = getUserById(id);
  if (!existing) return undefined;
  const next = { ...existing, ...patch };
  db.prepare('UPDATE users SET name = ?, avatar = ?, role = ? WHERE id = ?').run(next.name, next.avatar, next.role, id);
  return getUserById(id);
}

export function updateUserPassword(id: string, passwordHash: string) {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);
}

// ----------------------------------------------------
// Sessions
// ----------------------------------------------------
const SESSION_TTL_DAYS = 30;

export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    token,
    userId,
    createdAt.toISOString(),
    expiresAt.toISOString()
  );
  return token;
}

export function getUserBySessionToken(token: string): DbUser | undefined {
  if (!token) return undefined;
  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token) as
    | { token: string; user_id: string; expires_at: string }
    | undefined;
  if (!session) return undefined;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return undefined;
  }
  return getUserById(session.user_id);
}

export function deleteSession(token: string) {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

// ----------------------------------------------------
// Favorites
// ----------------------------------------------------
export function getFavorites(userId: string): string[] {
  const rows = db.prepare('SELECT destination_id FROM favorites WHERE user_id = ?').all(userId) as { destination_id: string }[];
  return rows.map((r) => r.destination_id);
}

export function toggleFavorite(userId: string, destinationId: string): string[] {
  const existing = db
    .prepare('SELECT 1 FROM favorites WHERE user_id = ? AND destination_id = ?')
    .get(userId, destinationId);
  if (existing) {
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND destination_id = ?').run(userId, destinationId);
  } else {
    db.prepare('INSERT INTO favorites (user_id, destination_id, created_at) VALUES (?, ?, ?)').run(
      userId,
      destinationId,
      new Date().toISOString()
    );
  }
  return getFavorites(userId);
}

// ----------------------------------------------------
// Itineraries
// ----------------------------------------------------
export function getItineraries(userId: string): any[] {
  const rows = db
    .prepare('SELECT payload FROM itineraries WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as { payload: string }[];
  return rows.map((r) => JSON.parse(r.payload));
}

export function upsertItinerary(userId: string, itinerary: any) {
  const existing = db.prepare('SELECT id FROM itineraries WHERE id = ?').get(itinerary.id);
  if (existing) {
    db.prepare('UPDATE itineraries SET payload = ? WHERE id = ? AND user_id = ?').run(
      JSON.stringify(itinerary),
      itinerary.id,
      userId
    );
  } else {
    db.prepare(
      'INSERT INTO itineraries (id, user_id, destination_id, destination_name, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(itinerary.id, userId, itinerary.destinationId, itinerary.destinationName, JSON.stringify(itinerary), new Date().toISOString());
  }
  return getItineraries(userId);
}

export function deleteItinerary(userId: string, itineraryId: string) {
  db.prepare('DELETE FROM itineraries WHERE id = ? AND user_id = ?').run(itineraryId, userId);
  return getItineraries(userId);
}

// ----------------------------------------------------
// Conversations (Ask the Place chat history)
// ----------------------------------------------------
export function getConversations(userId: string): any[] {
  const rows = db
    .prepare('SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC')
    .all(userId) as any[];
  return rows.map(rowToConversation);
}

export function getConversation(userId: string, conversationId: string): any | undefined {
  const row = db.prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?').get(conversationId, userId) as
    | any
    | undefined;
  return row ? rowToConversation(row) : undefined;
}

export function upsertConversation(userId: string, conv: any) {
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT id FROM conversations WHERE id = ?').get(conv.conversationId);
  if (existing) {
    db.prepare(
      'UPDATE conversations SET destination_id = ?, destination_name = ?, title = ?, messages = ?, updated_at = ? WHERE id = ? AND user_id = ?'
    ).run(conv.destinationId, conv.destinationName, conv.title, JSON.stringify(conv.messages || []), now, conv.conversationId, userId);
  } else {
    db.prepare(
      'INSERT INTO conversations (id, user_id, destination_id, destination_name, title, messages, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      conv.conversationId,
      userId,
      conv.destinationId,
      conv.destinationName,
      conv.title,
      JSON.stringify(conv.messages || []),
      conv.createdAt || now,
      now
    );
  }
  return getConversation(userId, conv.conversationId);
}

export function deleteConversation(userId: string, conversationId: string): boolean {
  const result = db.prepare('DELETE FROM conversations WHERE id = ? AND user_id = ?').run(conversationId, userId);
  return result.changes > 0;
}

function rowToConversation(row: any) {
  return {
    conversationId: row.id,
    userId: row.user_id,
    destinationId: row.destination_id,
    destinationName: row.destination_name,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: JSON.parse(row.messages || '[]'),
  };
}

const DEVELOPER_DEFAULT_AVATAR = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c" />
      <stop offset="100%" stop-color="#7c2d12" />
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#bg1)" stroke="#f97316" stroke-width="2"/>
  <path d="M38 48 C38 32 50 24 60 24 C70 24 82 32 82 48 C82 56 76 64 60 66 C44 64 38 56 38 48 Z" fill="#fed7aa"/>
  <path d="M34 40 C34 26 48 18 60 18 C74 18 86 28 86 42 C82 36 72 32 60 32 C48 32 38 36 34 40 Z" fill="#f97316"/>
  <path d="M48 20 C54 14 66 14 72 20 C66 22 54 22 48 20 Z" fill="#fbbf24"/>
  <circle cx="52" cy="46" r="2.5" fill="#431407"/>
  <circle cx="68" cy="46" r="2.5" fill="#431407"/>
  <path d="M50 56 C55 58 58 55 60 54 C62 55 65 58 70 56 C66 54 62 52 60 52 C58 52 54 54 50 56 Z" fill="#431407"/>
  <path d="M26 102 C28 78 44 70 60 70 C76 70 92 78 94 102 Z" fill="#fff7ed"/>
  <path d="M54 70 L60 88 L66 70 Z" fill="#ea580c"/>
</svg>`.trim())}`;

// ----------------------------------------------------
// Seed the demo account (Developer) so the "Try Demo Account" button
// on the login page keeps working. Idempotent — only runs once.
// ----------------------------------------------------
export function seedDemoAccount() {
  // Migrate legacy demo accounts if present
  const legacy = getUserByEmail('arjun.singh@heritage.in');
  if (legacy) {
    db.prepare("UPDATE users SET email = 'developer@hidden_india.in', name = 'Developer' WHERE id = ?").run(legacy.id);
  }

  const existing = getUserByEmail('developer@hidden_india.in');
  if (existing) {
    // Update name to Developer if it was not set
    if (existing.name !== 'Developer') {
      db.prepare("UPDATE users SET name = 'Developer' WHERE id = ?").run(existing.id);
    }
    // Update avatar to clean SVG avatar
    if (!existing.avatar || existing.avatar.includes('Indian_man_portrait') || existing.avatar.includes('googleusercontent') || existing.avatar.includes('utf8')) {
      db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(DEVELOPER_DEFAULT_AVATAR, existing.id);
    }
    return;
  }

  const passwordHash = bcrypt.hashSync('heritage123', 10);
  const user = createUser({
    name: 'Developer',
    email: 'developer@hidden_india.in',
    passwordHash,
    avatar: DEVELOPER_DEFAULT_AVATAR,
    role: 'Cultural Connoisseur',
  });

  for (const destId of ['bundi', 'majuli', 'orchha']) {
    toggleFavorite(user.id, destId);
  }
}

export function toPublicUser(u: DbUser): PublicUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar || '',
    role: u.role || 'Conscious Explorer',
    favoriteDestinationIds: getFavorites(u.id),
    savedItineraries: getItineraries(u.id),
  };
}

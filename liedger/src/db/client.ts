import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

import { getOrCreateDbKey } from '@/lib/secureKey';
import { CREATE_STATEMENTS } from './schema';
import * as schema from './schema';

const DB_NAME = 'liedger.db';

let _sqlite: SQLite.SQLiteDatabase | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _ready: Promise<void> | null = null;

/**
 * Open the database and run migrations exactly once.
 *
 * The encryption key is fetched here so the production SQLCipher swap is local
 * to this file: replace `SQLite.openDatabaseSync` with the op-sqlite/SQLCipher
 * opener and pass `key`.
 */
async function open(): Promise<void> {
  const key = await getOrCreateDbKey();
  void key; // reserved for the SQLCipher driver swap (see secureKey.ts)

  _sqlite = SQLite.openDatabaseSync(DB_NAME, {
    enableChangeListener: true, // powers Drizzle's useLiveQuery
  });
  _sqlite.execSync('PRAGMA journal_mode = WAL;');
  _sqlite.execSync('PRAGMA foreign_keys = ON;');

  for (const stmt of CREATE_STATEMENTS) {
    _sqlite.execSync(stmt);
  }

  _db = drizzle(_sqlite, { schema });
}

/** Idempotent initializer. Safe to call from multiple places. */
export function initDb(): Promise<void> {
  if (!_ready) _ready = open();
  return _ready;
}

/** The Drizzle client. Throws if accessed before initDb() resolves. */
export function getDb() {
  if (!_db) {
    throw new Error('Database not initialized — call initDb() first.');
  }
  return _db;
}

/** Raw expo-sqlite handle, for the rare direct query. */
export function getSqlite() {
  if (!_sqlite) {
    throw new Error('Database not initialized — call initDb() first.');
  }
  return _sqlite;
}

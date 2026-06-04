import { desc, eq } from 'drizzle-orm';

import { newId, now } from '@/lib/id';
import { getDb, getSqlite } from './client';
import { knows, lies, people, stories } from './schema';
import type { Lie } from './schema';

export type RiskLevel = 'low' | 'med' | 'high';
export type Channel = 'in_person' | 'text' | 'call' | 'email' | 'social' | 'other';

export interface CreateLieInput {
  claim: string;
  channel?: Channel;
  occurredAt?: number;
  risk?: RiskLevel;
  notes?: string;
  storyId?: string;
  storyTitle?: string; // create-or-reuse a story by title
  peopleNames?: string[]; // create-or-reuse people by name, link as edges
}

/** A lie joined with the names it touches, for list/detail rendering. */
export interface LieCard extends Lie {
  storyTitle: string | null;
  peopleNames: string[];
}

function findOrCreatePerson(name: string): string {
  const db = getDb();
  const trimmed = name.trim();
  const existing = db
    .select()
    .from(people)
    .where(eq(people.name, trimmed))
    .all();
  if (existing.length > 0) return existing[0].id;

  const id = newId();
  db.insert(people)
    .values({
      id,
      name: trimmed,
      avatarSeed: id.slice(0, 6),
      createdAt: now(),
    })
    .run();
  return id;
}

function findOrCreateStory(title: string): string {
  const db = getDb();
  const trimmed = title.trim();
  const existing = db
    .select()
    .from(stories)
    .where(eq(stories.title, trimmed))
    .all();
  if (existing.length > 0) return existing[0].id;

  const id = newId();
  const ts = now();
  db.insert(stories)
    .values({ id, title: trimmed, status: 'active', createdAt: ts, updatedAt: ts })
    .run();
  return id;
}

/** Create a lie, plus any new people/story, and the who-knows edges. */
export function createLie(input: CreateLieInput): string {
  const db = getDb();
  const ts = now();
  const id = newId();

  const storyId =
    input.storyId ??
    (input.storyTitle?.trim() ? findOrCreateStory(input.storyTitle) : null);

  db.insert(lies)
    .values({
      id,
      claim: input.claim.trim(),
      storyId: storyId ?? null,
      channel: input.channel ?? 'in_person',
      occurredAt: input.occurredAt ?? ts,
      createdAt: ts,
      status: 'active',
      risk: input.risk ?? 'low',
      notes: input.notes?.trim() || null,
    })
    .run();

  for (const name of input.peopleNames ?? []) {
    if (!name.trim()) continue;
    const personId = findOrCreatePerson(name);
    db.insert(knows)
      .values({
        id: newId(),
        lieId: id,
        personId,
        toldAt: input.occurredAt ?? ts,
        believes: true,
      })
      .run();
  }

  return id;
}

/** All lies, newest first, with story title and the people who heard them. */
export function listLieCards(): LieCard[] {
  const sqlite = getSqlite();
  const rows = sqlite.getAllSync<Lie & { story_title: string | null }>(
    `SELECT l.*, s.title AS story_title
       FROM lies l
       LEFT JOIN stories s ON s.id = l.story_id
      ORDER BY l.occurred_at DESC`,
  );

  return rows.map((r) => {
    const names = sqlite.getAllSync<{ name: string }>(
      `SELECT p.name FROM knows k
         JOIN people p ON p.id = k.person_id
        WHERE k.lie_id = ?`,
      [r.id],
    );
    return {
      ...(r as unknown as Lie),
      storyTitle: r.story_title,
      peopleNames: names.map((n) => n.name),
    };
  });
}

export function getLieCard(id: string): LieCard | null {
  const all = listLieCards();
  return all.find((l) => l.id === id) ?? null;
}

export function setLieStatus(
  id: string,
  status: Lie['status'],
): void {
  getDb().update(lies).set({ status }).where(eq(lies.id, id)).run();
}

export function deleteLie(id: string): void {
  getDb().delete(lies).where(eq(lies.id, id)).run();
}

export function countLies(): number {
  const row = getSqlite().getFirstSync<{ c: number }>(
    'SELECT COUNT(*) AS c FROM lies',
  );
  return row?.c ?? 0;
}

export interface PersonCard {
  id: string;
  name: string;
  role: string | null;
  avatarSeed: string | null;
  lieCount: number;
}

export function listPeopleCards(): PersonCard[] {
  return getSqlite().getAllSync<PersonCard>(
    `SELECT p.id, p.name, p.role, p.avatar_seed AS avatarSeed,
            COUNT(k.id) AS lieCount
       FROM people p
       LEFT JOIN knows k ON k.person_id = p.id
      GROUP BY p.id
      ORDER BY lieCount DESC, p.name ASC`,
  );
}

export interface Stats {
  totalLies: number;
  activeLies: number;
  exposedLies: number;
  storiesTracked: number;
  peopleInvolved: number;
  highRisk: number;
}

export function getStats(): Stats {
  const s = getSqlite();
  const one = (q: string) => s.getFirstSync<{ c: number }>(q)?.c ?? 0;
  return {
    totalLies: one('SELECT COUNT(*) AS c FROM lies'),
    activeLies: one("SELECT COUNT(*) AS c FROM lies WHERE status = 'active'"),
    exposedLies: one("SELECT COUNT(*) AS c FROM lies WHERE status = 'exposed'"),
    storiesTracked: one('SELECT COUNT(*) AS c FROM stories'),
    peopleInvolved: one('SELECT COUNT(*) AS c FROM people'),
    highRisk: one("SELECT COUNT(*) AS c FROM lies WHERE risk = 'high'"),
  };
}

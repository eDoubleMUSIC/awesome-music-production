import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Liedger data model.
 *
 * Core insight from the research: "who knows what" is an EDGE (the `knows`
 * table), not a column. That single decision powers contradiction detection,
 * the relationship graph, and "before you meet X" briefings.
 */

export const people = sqliteTable('people', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role'), // e.g. "Mom", "Boss", "Landlord"
  contactId: text('contact_id'), // optional link to device contacts (Phase 2)
  avatarSeed: text('avatar_seed'), // for a deterministic generated avatar color
  createdAt: integer('created_at').notNull(),
});

export const stories = sqliteTable('stories', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  // The private canonical truth, so you remember what actually happened.
  truth: text('truth'),
  summary: text('summary'),
  status: text('status', { enum: ['active', 'retired'] })
    .notNull()
    .default('active'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const lies = sqliteTable(
  'lies',
  {
    id: text('id').primaryKey(),
    claim: text('claim').notNull(), // what you told them
    storyId: text('story_id').references(() => stories.id, {
      onDelete: 'set null',
    }),
    channel: text('channel', {
      enum: ['in_person', 'text', 'call', 'email', 'social', 'other'],
    })
      .notNull()
      .default('in_person'),
    // when the lie was actually told (drives the alibi/timeline view)
    occurredAt: integer('occurred_at').notNull(),
    // when the record was created
    createdAt: integer('created_at').notNull(),
    status: text('status', {
      enum: ['active', 'retired', 'exposed', 'expired'],
    })
      .notNull()
      .default('active'),
    risk: text('risk', { enum: ['low', 'med', 'high'] })
      .notNull()
      .default('low'),
    notes: text('notes'),
  },
  (t) => ({
    byStory: index('lies_story_idx').on(t.storyId),
    byOccurred: index('lies_occurred_idx').on(t.occurredAt),
  }),
);

/** Edge: which person was told which lie, and whether they bought it. */
export const knows = sqliteTable(
  'knows',
  {
    id: text('id').primaryKey(),
    lieId: text('lie_id')
      .notNull()
      .references(() => lies.id, { onDelete: 'cascade' }),
    personId: text('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),
    toldAt: integer('told_at').notNull(),
    believes: integer('believes', { mode: 'boolean' }).notNull().default(true),
  },
  (t) => ({
    byLie: index('knows_lie_idx').on(t.lieId),
    byPerson: index('knows_person_idx').on(t.personId),
  }),
);

// Raw DDL used by the lightweight migration runner in client.ts.
// (We run statements directly rather than depending on Expo's network API
// during `drizzle-kit generate`.)
export const CREATE_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS people (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    contact_id TEXT,
    avatar_seed TEXT,
    created_at INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    truth TEXT,
    summary TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS lies (
    id TEXT PRIMARY KEY NOT NULL,
    claim TEXT NOT NULL,
    story_id TEXT REFERENCES stories(id) ON DELETE SET NULL,
    channel TEXT NOT NULL DEFAULT 'in_person',
    occurred_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    risk TEXT NOT NULL DEFAULT 'low',
    notes TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS knows (
    id TEXT PRIMARY KEY NOT NULL,
    lie_id TEXT NOT NULL REFERENCES lies(id) ON DELETE CASCADE,
    person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    told_at INTEGER NOT NULL,
    believes INTEGER NOT NULL DEFAULT 1
  );`,
  `CREATE INDEX IF NOT EXISTS lies_story_idx ON lies(story_id);`,
  `CREATE INDEX IF NOT EXISTS lies_occurred_idx ON lies(occurred_at);`,
  `CREATE INDEX IF NOT EXISTS knows_lie_idx ON knows(lie_id);`,
  `CREATE INDEX IF NOT EXISTS knows_person_idx ON knows(person_id);`,
];

export type Person = typeof people.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type Lie = typeof lies.$inferSelect;
export type Knows = typeof knows.$inferSelect;

export { sql };

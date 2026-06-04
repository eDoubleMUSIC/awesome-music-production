import type { Config } from 'drizzle-kit';

// Drizzle Kit config for generating SQL migrations from src/db/schema.ts.
// The app itself runs migrations via the lightweight runner in src/db/client.ts
// (CREATE_STATEMENTS), so this is optional tooling for when the schema grows.
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;

import * as Crypto from 'expo-crypto';

/** Generate a random UUID v4 for primary keys. */
export function newId(): string {
  return Crypto.randomUUID();
}

/** Current epoch milliseconds — our standard timestamp unit. */
export function now(): number {
  return Date.now();
}

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

/**
 * Database encryption key management.
 *
 * The key lives in the OS secure enclave (iOS Keychain / Android Keystore) via
 * expo-secure-store, gated to this device only and (optionally) behind
 * biometric authentication.
 *
 * NOTE ON ENCRYPTION-AT-REST:
 * Plain `expo-sqlite` does not encrypt the database file. For the shipping
 * build we swap the driver to `op-sqlite` compiled with SQLCipher and open the
 * DB with the key produced here, giving transparent AES-256 encryption at rest.
 * Until then, data is still protected by the OS app sandbox + the in-app
 * biometric lock. This module already produces and persists the key so that
 * the SQLCipher swap is a one-line change in `db/client.ts`.
 *   See: https://www.zetetic.net/sqlcipher/react-native/
 */
const DB_KEY_NAME = 'liedger.db.key.v1';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Get the persistent DB encryption key, creating it on first launch. */
export async function getOrCreateDbKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DB_KEY_NAME, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  if (existing) return existing;

  const bytes = Crypto.getRandomBytes(32); // 256-bit key
  const key = toHex(bytes);
  await SecureStore.setItemAsync(DB_KEY_NAME, key, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return key;
}

import * as SecureStore from 'expo-secure-store';

/**
 * Small, non-secret app flags persisted via SecureStore so they're readable
 * before the database is opened (e.g. during the lock/onboarding gate).
 */
export const Flags = {
  onboarded: 'liedger.onboarded',
  lockEnabled: 'liedger.lockEnabled',
  proUnlockedCache: 'liedger.proUnlocked', // cache; source of truth is RevenueCat
} as const;

export type FlagKey = (typeof Flags)[keyof typeof Flags];

export async function getFlag(key: FlagKey): Promise<boolean> {
  const v = await SecureStore.getItemAsync(key);
  return v === '1';
}

export async function setFlag(key: FlagKey, value: boolean): Promise<void> {
  await SecureStore.setItemAsync(key, value ? '1' : '0');
}

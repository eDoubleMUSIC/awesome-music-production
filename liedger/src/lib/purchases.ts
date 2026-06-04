import { Platform } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';

import { Flags, getFlag, setFlag } from './flags';

/**
 * Monetization: a single one-time LIFETIME unlock (no subscription).
 * Research: hard-ish paywalls convert ~5x better and ~2x LTV vs freemium
 * subscriptions for occasional-use utilities, and dodge subscription fatigue.
 *
 * Wraps RevenueCat, loaded LAZILY so the app also runs in Expo Go (which does
 * not bundle the native react-native-purchases module). If no API key is
 * configured (e.g. Expo Go, or before store setup), it degrades to a local
 * "dev" unlock backed by a flag, so the whole flow is testable end-to-end.
 */
export const PRO_ENTITLEMENT = 'pro';
export const LIFETIME_PRODUCT_ID = 'liedger_lifetime';
export const FREE_LIE_LIMIT = 10;

// TODO: paste real keys before shipping (RevenueCat dashboard).
const RC_API_KEY = {
  ios: process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '',
  android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '',
} as const;

let configured = false;

function hasKey(): boolean {
  const key = Platform.OS === 'ios' ? RC_API_KEY.ios : RC_API_KEY.android;
  return key.length > 0;
}

// Lazy native-module loader — never touched in Expo Go / dev mode.
async function loadPurchases() {
  const mod = await import('react-native-purchases');
  return mod.default;
}

export async function configurePurchases(): Promise<void> {
  if (configured || !hasKey()) return;
  const Purchases = await loadPurchases();
  Purchases.configure({
    apiKey: Platform.OS === 'ios' ? RC_API_KEY.ios : RC_API_KEY.android,
  });
  configured = true;
}

/** Is the lifetime unlock owned? Falls back to the local flag in dev mode. */
export async function isPro(): Promise<boolean> {
  if (!hasKey()) return getFlag(Flags.proUnlockedCache);
  try {
    await configurePurchases();
    const Purchases = await loadPurchases();
    const info = await Purchases.getCustomerInfo();
    const pro = info.entitlements.active[PRO_ENTITLEMENT] !== undefined;
    await setFlag(Flags.proUnlockedCache, pro);
    return pro;
  } catch {
    return getFlag(Flags.proUnlockedCache);
  }
}

/** Fetch the lifetime package from the current offering. */
export async function getLifetimePackage(): Promise<PurchasesPackage | null> {
  if (!hasKey()) return null;
  try {
    await configurePurchases();
    const Purchases = await loadPurchases();
    const offerings = await Purchases.getOfferings();
    const pkgs = offerings.current?.availablePackages ?? [];
    return (
      pkgs.find((p) => p.product.identifier === LIFETIME_PRODUCT_ID) ??
      pkgs[0] ??
      null
    );
  } catch {
    return null;
  }
}

/** Returns true if the user now owns Pro. */
export async function purchaseLifetime(): Promise<boolean> {
  // Dev mode (Expo Go / no keys): simulate a successful purchase so the flow
  // is fully testable.
  if (!hasKey()) {
    await setFlag(Flags.proUnlockedCache, true);
    return true;
  }
  try {
    await configurePurchases();
    const Purchases = await loadPurchases();
    const pkg = await getLifetimePackage();
    if (!pkg) return false;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const pro = customerInfo.entitlements.active[PRO_ENTITLEMENT] !== undefined;
    await setFlag(Flags.proUnlockedCache, pro);
    return pro;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!hasKey()) return getFlag(Flags.proUnlockedCache);
  try {
    await configurePurchases();
    const Purchases = await loadPurchases();
    const info = await Purchases.restorePurchases();
    const pro = info.entitlements.active[PRO_ENTITLEMENT] !== undefined;
    await setFlag(Flags.proUnlockedCache, pro);
    return pro;
  } catch {
    return false;
  }
}

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { initDb } from '@/db/client';
import { Flags, getFlag, setFlag } from '@/lib/flags';
import { authenticate, isBiometricAvailable } from '@/lib/lock';
import { configurePurchases, isPro as checkPro } from '@/lib/purchases';

interface AppState {
  ready: boolean;
  onboarded: boolean;
  completeOnboarding: () => Promise<void>;

  // Lock
  lockEnabled: boolean;
  locked: boolean;
  unlock: () => Promise<boolean>;
  setLockEnabled: (v: boolean) => Promise<void>;

  // Monetization
  pro: boolean;
  refreshPro: () => Promise<void>;
  setProLocally: (v: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [lockEnabled, setLockEnabledState] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pro, setPro] = useState(false);

  useEffect(() => {
    (async () => {
      await initDb();
      await configurePurchases();
      const [done, lock, isProNow] = await Promise.all([
        getFlag(Flags.onboarded),
        getFlag(Flags.lockEnabled),
        checkPro(),
      ]);
      setOnboarded(done);
      setLockEnabledState(lock);
      setLocked(lock); // start locked if enabled
      setPro(isProNow);
      setReady(true);
    })();
  }, []);

  const unlock = useCallback(async () => {
    const ok = await authenticate('Unlock your ledger');
    if (ok) setLocked(false);
    return ok;
  }, []);

  const setLockEnabled = useCallback(async (v: boolean) => {
    if (v) {
      const available = await isBiometricAvailable();
      if (!available) return; // caller should surface a message
    }
    await setFlag(Flags.lockEnabled, v);
    setLockEnabledState(v);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await setFlag(Flags.onboarded, true);
    setOnboarded(true);
  }, []);

  const refreshPro = useCallback(async () => {
    setPro(await checkPro());
  }, []);

  const setProLocally = useCallback((v: boolean) => setPro(v), []);

  const value = useMemo<AppState>(
    () => ({
      ready,
      onboarded,
      completeOnboarding,
      lockEnabled,
      locked,
      unlock,
      setLockEnabled,
      pro,
      refreshPro,
      setProLocally,
    }),
    [
      ready,
      onboarded,
      completeOnboarding,
      lockEnabled,
      locked,
      unlock,
      setLockEnabled,
      pro,
      refreshPro,
      setProLocally,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

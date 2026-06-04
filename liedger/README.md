# 📒 Liedger

> **Keep your stories straight.**
> A private, encrypted ledger of the little white lies you tell — so you never
> get caught contradicting yourself.

Liedger is a serious personal-memory utility with a funny hook, for everyday
people juggling small social fibs (excuses, plans, surprises, gifts). The name
is a placeholder pun (**lie + ledger**) — we'll workshop the final name.

Built cross-platform (iOS + Android) with **React Native + Expo**, one codebase.

---

## Why it exists

Research found the niche is wide open: **no app on either store** lets a person
track the lies *they* tell — the only products that literally do this are paper
notebooks on Amazon. Liedger is the digital version, plus the things paper
can't do: search, reminders, and cross-referencing who-believes-what.

## What's built (MVP / Phase 1)

- **Encrypted, local-only by design** — no account, no servers, no third-party
  analytics. Lets us honestly declare "Data Not Collected" on both stores, and
  it's the headline trust pitch. (DB encryption key is generated + stored in the
  device secure enclave; see "Encryption" below.)
- **Biometric app lock** (Face ID / Touch ID / fingerprint) — optional, toggled
  in Stats.
- **Fast capture** — a quick-add flow that opens straight into the claim field.
- **The data model that matters** — Lies, Stories (threads), People, and the
  **who-knows-what edges** that power everything else.
- **"Before you meet X" briefings** — tap a person to see exactly what they
  currently believe (the hero differentiator). Calendar auto-triggering is
  Phase 2.
- **Onboarding** that seeds funny example lies to beat the blank-page problem.
- **Shareable stats card** — the primary organic-growth surface.
- **Monetization: one-time lifetime unlock** (no subscription) via RevenueCat,
  with a free tier capped at 10 lies. Falls back to a local "dev" unlock when no
  store keys are configured, so the whole flow is testable immediately.

## Roadmap

- **Phase 2:** on-device contradiction detection (Apple Foundation Models / NLI),
  who-knows-what graph visualization, calendar-triggered briefings, geofence
  reminders, duress/decoy PIN (disclosed to App Review).
- **Phase 3:** optional E2EE multi-device sync (PowerSync + Supabase,
  client-side encryption only), Apple Watch quick capture.

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | React Native + Expo (SDK 56), Expo Router |
| Local DB | expo-sqlite + Drizzle ORM |
| Encryption key | expo-secure-store (Keychain / Android Keystore) |
| Biometrics | expo-local-authentication |
| Reminders | expo-notifications |
| Payments | react-native-purchases (RevenueCat) |

## Project layout

```
app/                      Expo Router screens
  _layout.tsx             Providers + lock gate + routing
  index.tsx               Redirect into tabs
  onboarding.tsx          First-run, seeds example lies
  add.tsx                 Quick capture (modal)
  paywall.tsx             One-time lifetime unlock
  lie/[id].tsx            Lie detail + status actions
  (tabs)/
    index.tsx             Ledger (list of lies)
    people.tsx            People + "before you meet" briefings
    stats.tsx             Stats, shareable card, settings
src/
  db/        schema.ts · client.ts · repo.ts · seed.ts
  lib/       secureKey · lock · purchases · notifications · briefings · format · id · flags
  state/     app.tsx (provider)
  components/ ui.tsx
  theme.ts
```

## Run it

```bash
cd liedger
npm install
npx expo start            # press i / a, or scan with a dev build
npm run typecheck         # tsc --noEmit
```

> Native modules (biometrics, SQLite, purchases) require a **development build**
> (`npx expo run:ios` / `run:android` or EAS), not Expo Go.

## Encryption note

Plain `expo-sqlite` does not encrypt the DB file; data is currently protected by
the OS app sandbox + the in-app biometric lock. The encryption key is already
generated and stored in the secure enclave (`src/lib/secureKey.ts`), so enabling
**transparent AES-256 at rest** is a one-file swap to `op-sqlite` compiled with
SQLCipher in `src/db/client.ts`. See https://www.zetetic.net/sqlcipher/react-native/

## Before shipping

- [ ] Add RevenueCat API keys (`EXPO_PUBLIC_RC_IOS_KEY` / `EXPO_PUBLIC_RC_ANDROID_KEY`) and a `liedger_lifetime` product.
- [ ] Swap to op-sqlite + SQLCipher for at-rest encryption.
- [ ] Write the "we collect nothing" privacy policy; complete both stores' privacy forms as "Data Not Collected".
- [ ] Position as a private memory aid — never "get away with lying" — to clear App Review.

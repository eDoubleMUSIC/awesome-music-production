# "Keep Your Stories Straight" — White-Lie Tracker App
## Research Report & Build Plan (June 2026)

**Positioning:** A genuinely useful personal-memory utility ("keep your stories straight"), marketed with humor.
**Primary user:** Everyday white-liars juggling small social fibs (excuses, plans, surprises, gifts).
**Build priority:** Cross-platform, one codebase, ship fast.

---

## TL;DR — The 7 decisions that matter

1. **The niche is genuinely empty.** No iOS or Android app lets a person track the lies *they* tell. The only products that literally do this are paper notebooks on Amazon — real latent demand, zero digital supply.
2. **Build it on React Native + Expo.** Best velocity, hiring pool, and AI-tooling for a small team; performance is more than adequate for a text-and-reminders app.
3. **Go local-only / no-account / no third-party SDKs.** This one architectural choice lets you *legitimately* declare "Data Not Collected" on both stores and collapses almost all GDPR/CCPA burden. It's also your #1 trust/marketing message.
4. **The killer feature is "before you meet X" briefings** — calendar-triggered notifications telling you what each person believes. Fully buildable on standard APIs.
5. **Model "who-knows-what" as graph *edges*, not fields.** That single decision powers contradiction detection, the relationship graph, and pre-meeting briefings.
6. **Monetize with a one-time lifetime unlock (~$4.99–$6.99), not a subscription.** Hard-ish paywalls convert ~5x better and ~2x the LTV vs. freemium-subscription for utilities, and dodge subscription fatigue.
7. **Avoid the "disguise/decoy" trap on iOS.** A calculator-vault disguise is a documented removal-and-ban risk. An *openly* private, biometric-locked journal (with a *disclosed* duress-PIN) is fine.

---

## 1. Competitive landscape — wide-open whitespace

**The exact niche is empty (verified, not estimated).** Searches across "lie tracker," "white lie," "secret keeper," "keep your stories straight," "fib tracker" on both stores surfaced only three *unrelated* buckets:

- **Lie-*detector* gag apps** (fake polygraphs that "test" other people) — crowded, entertainment-only, no scientific basis. Not competitors; they only collide on keywords (matters for ASO). E.g. [Lie Detector Truth Test](https://apps.apple.com/us/app/lie-detector-truth-test/id1113503715), [Google Play polygraph](https://play.google.com/store/apps/details?id=com.offlineapps.polygraph).
- **Locked-diary apps** — privacy/locking but no concept of a "lie," who-was-told, or consistency. E.g. [Secret Diary With Lock](https://apps.apple.com/us/app/secret-diary-with-lock/id1474212821).
- **Paper notebooks — the only products that literally do this:** [Lie Tracker Journal](https://www.amazon.com/Lie-Tracker-Journal-Allan-Adimoolah/dp/B0932CS7VP) (logs date, time, lie type, description, reason, repeated?, forgiven?), [Little Book of Lies](https://www.amazon.com/Little-Book-Lies-Keep-Track/dp/B095NPBY5L). These **already validate the data model** (who/what/why/repeat/status) — proof a digital version doesn't exist yet.

**Adjacent apps that prove the mechanics you'll need:**

| App | Price | Relevant proven mechanic |
|---|---|---|
| **Monica (PRM)** | Free / $9/mo / $90/yr | Journal entries **tagged to specific people** (= "which lie did I tell whom"); per-contact reminder cadence. No native app. [features](https://www.monicahq.com/features) · [GitHub](https://github.com/monicahq/monica) |
| **Dex** | ~$12/mo | Auto-pulled interaction history, "keep in touch" reminders. ~3.77★/260 ratings. [App Store](https://apps.apple.com/us/app/dex-rolodex-and-personal-crm/id1472132715) |
| **Clay / "Mesh"** | ~$10/mo | **Relationship mapping/graph**, auto-surfaced context — repurposable as a "who-might-compare-notes" risk map. [Dex vs Clay](https://getdex.com/blog/dex-vs-clay/) |
| **Day One** | ~$35/yr | Multi-format capture, multiple journals, **E2E encryption**, streaks. 4.8★/92K (iOS). [plans](https://dayoneapp.com/plans/) |
| **Daylio** | Freemium | Gold-standard **tap-to-log** frictionless capture. [daylio.net](https://daylio.net/) |
| **Reflectly** | $9.99/mo / $59.99/yr | AI prompts + daily reminders + **pattern surfacing over time**. |

**Gaps / opportunities:**
- Niche genuinely empty; paper-notebook demand with zero digital supply.
- Data model already validated by the notebooks; digital adds search, reminders, cross-referencing.
- **"Relationship graph as a consistency-risk map" is the killer differentiator** — no competitor in any adjacent category does it.
- Low-friction discreet capture + encryption are table-stakes *and proven sellable* (Daylio, Day One).
- Proven willingness to pay **~$35–$60/yr** for journaling/CRM with reminders.

---

## 2. Recommended tech stack (React Native + Expo)

In 2026, Expo *is* the official way to start React Native, so the real choice is **RN+Expo vs Flutter** ([PkgPulse](https://www.pkgpulse.com/blog/react-native-vs-flutter-vs-expo-2026)).

| Dimension | RN + Expo | Flutter |
|---|---|---|
| MVP velocity | Fastest; 50+ first-party Expo modules | Fast once Dart is learned |
| Performance | New Architecture (Fabric/JSI) — ample for text/reminders | Edge in heavy animation only |
| Hiring | ~45K postings | ~18K postings |
| AI-assisted coding | Strongest (TS has deepest LLM corpus) | Weaker for Dart |

**Verdict: React Native + Expo.** You don't need Flutter's animation edge; you do need velocity, hiring, AI-tooling, and a mature local-first + encryption + biometric ecosystem.

**The concrete stack:**

| Concern | Pick | Why |
|---|---|---|
| Framework | **React Native + Expo** (New Architecture) | Velocity, one TS codebase |
| Local DB | **expo-sqlite** (or op-sqlite for max perf) + **Drizzle ORM** | SQLite is the clearest path to encryption + sync |
| Encryption at rest | **SQLCipher** (AES-256, whole-DB) via op-sqlite | Transparent, low overhead |
| Key storage | **expo-secure-store** (Keychain / Android Keystore, hardware-backed) | Never hardcode the DB key |
| Biometric lock | **expo-local-authentication** | Gate *release of the SQLCipher key*, not just the UI |
| Small state | **react-native-mmkv** (encrypted) | Fast prefs/flags |
| Reminders | **expo-notifications** (→ **Notifee** if richer) | Mind iOS's **64 pending-notification limit** |
| Optional E2EE sync (Phase 2+) | **PowerSync + Supabase** | Syncs client-side-encrypted cipher envelopes; server sees only ciphertext |

**Key pattern:** on first launch generate a random DB key → store in Keychain/Keystore → open SQLCipher with it → gate the key's release behind the biometric prompt.

**Avoid:** Realm/Atlas Device Sync (MongoDB EOL'd it; sync shut down 2025-09-30); Isar/Hive on Flutter (effectively abandoned/community-forked). Turso offline sync is still beta.

Sources: [PowerSync RN DB options](https://powersync.com/blog/react-native-local-database-options) · [op-sqlite](https://op-engineering.github.io/op-sqlite/docs/installation/) · [Zetetic SQLCipher RN](https://www.zetetic.net/sqlcipher/react-native/) · [expo-secure-store via SQLCipher](https://github.com/expo/expo/issues/34891) · [expo-local-authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/) · [PowerSync E2EE docs](https://docs.powersync.com/client-sdks/advanced/data-encryption) · [iOS 64-notification limit](https://github.com/MaikuB/flutter_local_notifications/issues/2312) · [MongoDB Atlas EOL](https://www.mongodb.com/community/forums/t/atlas-device-sync-end-of-life-and-deprecation/296687)

---

## 3. Privacy, trust & legal — local-only is a superpower

The single most important decision: **store everything on-device, no account, no third-party SDKs.** That collapses most disclosure/legal burden *and* is your headline trust feature.

- **Apple App Privacy ("nutrition labels") — REQUIRED.** Apple's definition: "collect" = transmitting data off-device. **On-device-only data is not "collected"** → a true local-only app can legitimately declare **"Data Not Collected."** Adding *any* analytics/crash/ads SDK, cloud sync, or backend breaks this. [Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- **Google Play Data Safety — REQUIRED.** Collect nothing → declare "No data collected/shared." Note: **account creation triggers a mandatory in-app *and* web deletion path** — another reason to avoid accounts. [Play Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- **Encryption at rest (RECOMMENDED, your core trust feature):**
  - iOS: `NSFileProtectionComplete` (key evicted when device locks) + Keychain with `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` (Secure Enclave). [Apple Keychain](https://support.apple.com/guide/security/keychain-data-protection-secb0694df1a/web)
  - Android: **Android Keystore** (StrongBox where available). **Note:** Jetpack `EncryptedSharedPreferences`/`EncryptedFile` are **deprecated as of security-crypto 1.1.0 (2025)** — use platform crypto + Keystore directly. [Jetpack Security](https://developer.android.com/jetpack/androidx/releases/security)
  - Gate the *decryption key* on biometrics (iOS `SecAccessControl`; Android `BiometricPrompt` + `setUserAuthenticationRequired`).
- **App-lock = fine. Disguise/decoy = HIGH RISK on iOS.** Apple §2.3.1 bans hidden/undocumented features; §1.1.6 bans trick/joke functionality and says "for entertainment purposes" *won't* excuse it; repeat dishonesty → **account termination**. Calculator-vault disguises are regularly removed. **Safe path:** ship an *openly* private, biometric-locked journal; if you add a duress/decoy PIN, **document it to App Review and in the listing**. [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Legal:** the lying *theme* isn't objectionable; risk only arises from shared user-generated content — so **keep it single-user/local** to avoid the UGC-moderation regime. A **privacy policy is REQUIRED on both stores even if you collect nothing** (say exactly that). Local-first satisfies GDPR Art. 25 / data-minimization "by construction" — but adding sync/analytics/accounts makes you a controller with full obligations. Add Terms disclaiming liability and warning **data is device-only and lost if the device/app is lost**.

**Compliance checklist:** local-only + no account + no 3rd-party SDKs → "Data Not Collected" · complete both privacy forms accurately · publish a privacy policy (in-app + both consoles) · encrypt at rest (Keychain/Keystore, not deprecated Jetpack wrapper) · gate the key on biometrics · document any decoy/duress-PIN, never disguise the app · keep single-user/no shared UGC · re-declare everything if you ever add sync/accounts.

---

## 4. UX & ease of use

**Fast capture (the make-or-break flow — target <5s, log discreetly).** Use the Drafts model: **capture once into a blank field with the keyboard up, tag/route later.** Ship three paths at launch:
- **iOS:** App Intents → Lock-Screen **Control widget** ("Log a lie"), Siri/Action Button voice ("log a lie"), home-screen quick-add widget, share-sheet. [App Intents](https://developer.apple.com/documentation/appintents) · [Controls](https://developer.apple.com/documentation/widgetkit/creating-controls-to-perform-actions-across-the-system)
- **Android:** App Shortcuts + Quick Settings tile + **Direct Share targets** (forward the actual fib text from Messages/WhatsApp straight into an entry). [Direct Share](https://developer.android.com/training/sharing/direct-share-targets)
- **Voice / Apple Watch** for moments when pulling out your phone is socially awkward.

**Data model (borrow from PRM + graph DBs):**

| Entity | Key fields |
|---|---|
| **Lie** | text/claim, created_at, **occurred_at**, channel, status (active/retired/exposed/expired), risk |
| **Story (thread)** | title, summary, member lies[], private "canonical truth" note, status |
| **Person** | contact link, role, audience grouping |
| **Knows** (edge) | person ↔ lie/story, told_on date, believes? — *the who-knows-what graph* |
| **Reminder** | trigger (time / geofence / calendar-meeting), payload (which story to review) |

Keep both `created_at` and `occurred_at` (alibi/timeline needs the latter). Add a status lifecycle with optional TTL so stale low-risk lies auto-archive.

**Contextual surfacing (the high-value bit):** match **calendar** attendees to People and fire a pre-meeting briefing ("Seeing Mom in 1hr — she thinks you quit smoking and you're dating someone named Alex"). Geofence reminders (EventKit `EKStructuredLocation` + CoreLocation) for recurring locations are a good secondary. **Caveat:** you can't track *another* person's real-time GPS — drive "before you meet" from *your* calendar + *your* geofences. [EventKit location reminders](https://developer.apple.com/documentation/eventkit/managing-location-based-reminders)

**Onboarding (utility apps: efficiency > delight):** no tour. First screen = "Log your first white lie" with two funny tappable example chips ("Told boss I was sick" / "Said I loved the gift") that seed the app so the person/story model populates instantly. **Defer every permission to its moment of value** (ask for calendar access only when setting up the first "before you meet" reminder). NN/g: contextual help > upfront tutorials; progressive disclosure for graph/AI/geofences. Completing a first meaningful action → 2–3x retention. [NN/g onboarding](https://www.nngroup.com/articles/mobile-app-onboarding/)

---

## 5. Standout features — ranked by impact vs. effort

| Feature | Impact | Effort | Notes |
|---|---|---|---|
| **Fast capture** (widget + Siri/share-sheet + voice) | Very High | Med | The make-or-break flow; capture-then-route |
| **"Before you meet X" briefings** (calendar-triggered) | Very High | Med | Standard calendar APIs; can't use others' GPS |
| **People + story threads w/ who-knows edges** | High | Med | Foundation for everything below |
| **Empty-state + permission-on-demand onboarding** | High | Low | Seed funny examples; 2–3x retention |
| **Alibi / timeline view** (by `occurred_at`) | High | Low–Med | Read view over existing data |
| **Anonymized shareable stats + streaks** | Med–High | Low | Virality + retention + humor payload |
| **On-device contradiction/consistency check** | High | **High** | NLI on lies sharing a person/story; Apple Foundation Models (on-device, private); run async; tune against false positives |
| **Who-knows-what graph visualization** | Med | Med–High | Data's already edges; viz is the cost; great demo "wow" |
| **Geofence reminders** (recurring locations) | Med | Med | Secondary to calendar triggers |
| **Panic-hide / duress-PIN** | Med | Med | On-brand; **disclose to App Review**; iOS icon-disguise limited |

On AI: given the data's extreme sensitivity, do consistency checks **on-device** (Apple Foundation Models ~3B param, free, private, offline — good for entity-extraction/NLI when broken into small tasks), scoped to lies sharing a person/story, run asynchronously (not on keystroke). [Apple Foundation Models](https://machinelearning.apple.com/research/introducing-apple-foundation-models)

---

## 6. Monetization & go-to-market

- **Model: freemium taste → one-time lifetime unlock** (near-hard paywall). Hard paywalls convert ~**12% vs ~2%** for freemium and ~**2x LTV** (~$49 vs ~$24 Y1); subscription fatigue is pushing the market to lifetime/one-time. A novelty utility is occasional-use, so a subscription (esp. weekly) feels exploitative and spikes refunds. [RevenueCat State of Subscription Apps](https://www.revenuecat.com/state-of-subscription-apps-2025/) · [Adapty](https://adapty.io/blog/freemium-to-premium-conversion-techniques/)
- **Price:** **$4.99–$6.99 one-time lifetime "Pro"** (hero SKU; $9.99 anchor defensible if rich), optional **$9.99/yr "supporter"** for the minority who want recurring. No weekly.
- **Tooling:** **RevenueCat** (free under $2.5K/mo, ~30-min integration, one entitlement model across StoreKit + Play Billing). Revisit native only at scale.
- **Growth (3 tactics):**
  1. **TikTok/Reels-native UI demos (the Locket playbook** — built for a girlfriend, ~80M downloads after a TikTok walkthrough): make the in-app experience screen-record-worthy — a shareable "stats card" ("Stories tracked: 47 · Closest call: ⚠️") + a TikTok-specific Custom Product Page. [Locket story](https://whatastartup.substack.com/p/he-built-an-app-for-his-girlfriend-and-ended-up-having-80-million-total-downloads)
  2. **ASO built for the meme:** keyword-aware screenshot captions (Apple now indexes them since June 2025), funny-but-clear subtitle, in-app review prompt fired after a "win" to clear the 4.0-rating bar 77% of users check. [ASO 2026](https://asomobile.net/en/blog/aso-in-2026-the-complete-guide-to-app-optimization/)
  3. **Coordinated community launch:** pre-build a small Reddit/waitlist audience, single Product Hunt day, lightweight share-to-unlock referral.
- **Retention reality:** utility apps run only ~3–4% Day-30; ~48% of apps uninstalled within 30 days. The funny hook drives the install spike; the **real recurring utility** (reminders that fire when a story is relevant) is what converts the spike to LTV — which is exactly why "serious utility, funny hook" is the right call, and why monetizing at the value moment (one-time unlock) beats recurring billing here.

---

## Recommended MVP vs. later phases

**MVP (v1.0) — ship the wedge:**
- Local-only, no account, SQLCipher-encrypted DB, biometric app-lock.
- Fast capture: home-screen widget + Siri/share-sheet + voice; capture-then-route.
- Core model: Lies, Stories/threads, People, who-knows edges.
- **"Before you meet X" calendar briefings** (the hero differentiator).
- Timeline/alibi view + search.
- Onboarding: seeded funny examples, permissions on-demand.
- Monetization: free taste → $4.99–$6.99 lifetime unlock via RevenueCat.
- Shareable anonymized stats card (for virality).

**Phase 2:**
- On-device contradiction/consistency checks (Apple Foundation Models / NLI).
- Who-knows-what graph visualization.
- Geofence reminders for recurring locations.
- Duress/decoy PIN (disclosed to App Review).

**Phase 3:**
- Optional E2EE cloud sync / multi-device (PowerSync + Supabase, client-side encryption only).
- Apple Watch app; richer Notifee scheduling.

---

## Concrete next steps

1. **Lock positioning copy** that threads the needle: an openly private "memory aid for keeping your social stories consistent," funny in tone, never "get away with lying." Protects you at App Review and in PR.
2. **Scaffold the app:** `npx create-expo-app`, add op-sqlite + Drizzle + SQLCipher, expo-secure-store, expo-local-authentication, expo-notifications, RevenueCat.
3. **Prototype the hero loop first:** capture → tag to a Person/Story → calendar-triggered "before you meet" briefing. If that feels magic, the app works.
4. **Draft the "we collect nothing, everything stays on your device" privacy policy** and design the App Review notes (document any decoy/lock features).
5. **Build the shareable stats card early** — it's your main growth surface.
6. **Pre-build a small audience** (Reddit + waitlist) ahead of a Product Hunt launch.

---

*Compiled June 2026 from multi-source web research with adversarial sanity-checking. Several Apple/NN/g/RevenueCat pages return 403 to automated fetch and render client-side; their URLs are correct and citable, but open them directly to pull exact API signatures and verbatim figures.*

# 📱 Try Liedger on your iPhone

> Heads-up on why this needs a few steps: a custom app can't be side-loaded onto
> a stock iPhone with just the phone — Apple requires either **Expo Go** (a free
> host app) or a **signed build** (TestFlight / dev build, which needs a paid
> Apple Developer account). The cloud environment Claude runs in can't reach
> Expo's servers, so the dev server / build has to run from *your* computer or
> Expo account. Both routes are below.

---

## ✅ Fastest: Expo Go (free · ~5 min · no Mac, no Apple Developer account)

You need any computer (Mac/Windows/Linux) for ~5 minutes, on the same Wi-Fi as
your phone (or use `--tunnel`).

1. **On your iPhone:** install **Expo Go** from the App Store.
2. **On your computer**, install Node.js 20+, then:
   ```bash
   git clone https://github.com/eDoubleMUSIC/awesome-music-production.git
   cd awesome-music-production/liedger
   git checkout claude/missing-app-chat-YJ4kq
   npm install
   npx expo start
   ```
3. A **QR code** appears in the terminal. Open the **Camera** app on your iPhone
   and point it at the QR → tap the banner to open in Expo Go.
   - If your phone and computer aren't on the same network, run
     `npx expo start --tunnel` instead (free Expo account required; it'll prompt
     you to log in or sign up).
4. Liedger loads on your phone. 🎉

**What works in Expo Go:** everything — capture, ledger, people, "before you
meet" briefings, stats, biometric Face ID lock, and the paywall (it runs in
**dev-unlock mode**, so "Unlock for life" flips you to Pro without charging,
perfect for testing). Real payments only activate once RevenueCat keys are added
and you use a real build.

---

## 🛠️ Real install on the device: EAS Build → TestFlight

Use this when you want it on your phone **without** keeping a dev server running,
or to test real in-app purchases. Builds happen on Expo's cloud (free tier).

**Requirements:** a free [Expo account](https://expo.dev) and a paid
[Apple Developer account](https://developer.apple.com/programs/) ($99/yr — Apple's
requirement for installing on physical devices / TestFlight).

From your computer (the project already includes `eas.json`):

```bash
cd awesome-music-production/liedger
npm install -g eas-cli
eas login
eas build --platform ios --profile preview   # ad-hoc build for your device
```

- For **ad-hoc / internal distribution**, EAS will help register your iPhone's
  UDID, then give you a QR/link to install the `.ipa` directly.
- For **TestFlight**, run `eas build --platform ios --profile production` then
  `eas submit -p ios`, and install via the TestFlight app.

---

## 🍎 If you have a Mac: run it in the iOS Simulator or on a cable-connected phone

```bash
cd awesome-music-production/liedger
npm install
npx expo run:ios            # builds a dev client and launches the simulator
# or plug in your iPhone and select it as the run target
```

This produces a full development build (all native modules, including real
RevenueCat), not the Expo Go sandbox.

---

### Recommendation
Start with **Expo Go** to play with it today. Move to **EAS Build / TestFlight**
when you want a standalone install or to test real purchases.

# eDouble MUSIC — 3D scroll site

A self-contained static site (no build step, no external requests) with a real
WebGL 3D scene. The camera flies through a universe — giant vinyl, equalizer
ring, studio faders, particle vortex, portal — over an animated waveform
terrain, all driven by scroll.

## Files

- `index.html` — content sections (Home / Music / Studio / About / Connect)
- `css/style.css` — styling, depth-layer reveal animations
- `js/main.js` — Three.js scene + scroll-driven camera path
- `vendor/three.module.min.js` — vendored Three.js r166 (see `THREE-LICENSE.txt`)

## Run locally

Any static server works (ES modules require http, not `file://`):

```sh
cd docs
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy to www.edoublemusic.com

**Option A — GitHub Pages (free):**

1. Repo → Settings → Pages → Source: *Deploy from a branch*, branch `master`, folder `/docs`.
2. Under *Custom domain* enter `www.edoublemusic.com` (this creates a `CNAME` file).
3. At your DNS provider, add a `CNAME` record: `www` → `<your-github-username>.github.io`.
4. Wait for the certificate, then enable *Enforce HTTPS*.

**Option B — any host:** upload the contents of `docs/` to the web root. There
is no build step and no server-side code.

## Customizing

- Text/links live in `index.html`.
- Colors: CSS variables at the top of `css/style.css` and the `PINK/CYAN/VIOLET`
  constants in `js/main.js`.
- Camera route: the `camPath` waypoints in `js/main.js` (one per section).

Accessibility: honors `prefers-reduced-motion`, degrades to a gradient
background if WebGL is unavailable, and all content is plain HTML.

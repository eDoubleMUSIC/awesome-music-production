/* ============================================================
   eDouble MUSIC — 3D scroll experience
   A WebGL universe the camera flies through as you scroll:
   hero vinyl → equalizer ring → studio faders → note vortex
   → portal, over an endless waveform terrain.
   ============================================================ */

import * as THREE from 'three';

const PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;

/* ------------------------------------------------------------
   DOM wiring (works even if WebGL fails)
   ------------------------------------------------------------ */

const panels = [...document.querySelectorAll('.panel')];
const dots = [...document.querySelectorAll('[data-dot]')];
const progressBar = document.getElementById('progressBar');
document.getElementById('year').textContent = new Date().getFullYear();

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        const idx = Number(e.target.dataset.section);
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        if (e.target.id === 'about') runCounters(e.target);
      }
    }
  },
  { threshold: 0.35 }
);
panels.forEach((p) => io.observe(p));

let countersDone = false;
function runCounters(scope) {
  if (countersDone) return;
  countersDone = true;
  scope.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const t0 = performance.now();
    const dur = PRM ? 1 : 1400;
    (function tick(now) {
      const k = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  });
}

/* ------------------------------------------------------------
   Scroll state (shared by DOM + WebGL)
   ------------------------------------------------------------ */

let scrollTarget = 0; // raw 0..1
let scrollEased = 0;  // smoothed 0..1

function readScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollTarget = max > 0 ? window.scrollY / max : 0;
  progressBar.style.width = `${(scrollTarget * 100).toFixed(2)}%`;
}
window.addEventListener('scroll', readScroll, { passive: true });
readScroll();

/* Mouse parallax */
const mouse = { x: 0, y: 0 };
if (!PRM && !IS_MOBILE) {
  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });
}

/* ------------------------------------------------------------
   WebGL scene
   ------------------------------------------------------------ */

const canvas = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !IS_MOBILE, alpha: false });
} catch {
  canvas.remove(); // graceful fallback: CSS gradient background remains
}

if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_MOBILE ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x06020f);
  scene.fog = new THREE.FogExp2(0x06020f, 0.016);

  const camera = new THREE.PerspectiveCamera(
    55, window.innerWidth / window.innerHeight, 0.1, 400
  );

  /* ---------- lights ---------- */
  scene.add(new THREE.AmbientLight(0x3a2a66, 1.2));
  const keyLight = new THREE.PointLight(0xff3d81, 900, 160, 1.8);
  const fillLight = new THREE.PointLight(0x54e8ff, 700, 160, 1.8);
  scene.add(keyLight, fillLight);

  /* ---------- materials palette ---------- */
  const PINK = 0xff3d81, CYAN = 0x54e8ff, VIOLET = 0x8b5cf6;

  /* ---------- waveform terrain (persists through the journey) ---------- */
  const TERRAIN_SEG = IS_MOBILE ? 70 : 110;
  const terrainGeo = new THREE.PlaneGeometry(420, 420, TERRAIN_SEG, TERRAIN_SEG);
  terrainGeo.rotateX(-Math.PI / 2);
  const terrainBase = terrainGeo.attributes.position.array.slice();
  const terrain = new THREE.Mesh(
    terrainGeo,
    new THREE.MeshBasicMaterial({
      color: VIOLET, wireframe: true, transparent: true, opacity: 0.22,
    })
  );
  terrain.position.set(0, -16, -120);
  scene.add(terrain);

  function waveTerrain(t) {
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = terrainBase[i * 3];
      const z = terrainBase[i * 3 + 2];
      pos.array[i * 3 + 1] =
        Math.sin(x * 0.055 + t * 0.8) * 2.2 +
        Math.sin(z * 0.045 + t * 0.55) * 2.6 +
        Math.sin((x + z) * 0.02 + t * 0.3) * 1.4;
    }
    pos.needsUpdate = true;
  }

  /* ---------- starfield ---------- */
  const STAR_COUNT = IS_MOBILE ? 1200 : 3000;
  const starPos = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    starPos[i * 3] = THREE.MathUtils.randFloatSpread(240);
    starPos[i * 3 + 1] = THREE.MathUtils.randFloat(-20, 90);
    starPos[i * 3 + 2] = THREE.MathUtils.randFloat(-300, 40);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starTex = makeGlowSprite();
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      size: 1.5, map: starTex, transparent: true, opacity: 0.85,
      color: 0xcfd6ff, depthWrite: false, blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
  );
  scene.add(stars);

  function makeGlowSprite() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.5)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* ---------- station 0 · giant vinyl ---------- */
  function makeVinyl(radius = 9) {
    const group = new THREE.Group();
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 0.35, 64),
      new THREE.MeshStandardMaterial({ color: 0x0d0d14, roughness: 0.35, metalness: 0.6 })
    );
    const label = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.34, radius * 0.34, 0.4, 48),
      new THREE.MeshStandardMaterial({
        color: PINK, roughness: 0.5, emissive: PINK, emissiveIntensity: 0.35,
      })
    );
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.12, 12, 80),
      new THREE.MeshBasicMaterial({ color: CYAN })
    );
    rim.rotation.x = Math.PI / 2;
    // grooves
    for (let r = radius * 0.45; r < radius * 0.95; r += radius * 0.09) {
      const groove = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.02, 6, 64),
        new THREE.MeshBasicMaterial({ color: 0x2b2b3a })
      );
      groove.rotation.x = Math.PI / 2;
      groove.position.y = 0.19;
      group.add(groove);
    }
    group.add(disc, label, rim);
    return group;
  }
  const vinyl = makeVinyl();
  vinyl.position.set(10, 4, -24);
  vinyl.rotation.set(1.15, 0, -0.35);
  scene.add(vinyl);

  /* ---------- station 1 · equalizer ring ---------- */
  const EQ_BARS = 56;
  const eqRing = new THREE.Group();
  const eqBars = [];
  for (let i = 0; i < EQ_BARS; i++) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 1, 0.7),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().lerpColors(
          new THREE.Color(PINK), new THREE.Color(CYAN), i / EQ_BARS
        ),
        transparent: true,
        opacity: 0.85,
        toneMapped: false, // keep the neon saturated under ACES
      })
    );
    const a = (i / EQ_BARS) * Math.PI * 2;
    bar.position.set(Math.cos(a) * 11, 0, Math.sin(a) * 11);
    eqRing.add(bar);
    eqBars.push(bar);
  }
  eqRing.position.set(-8, 2, -84);
  scene.add(eqRing);

  /* ---------- station 2 · studio faders ---------- */
  const faders = new THREE.Group();
  const faderKnobs = [];
  const FADERS = 12;
  for (let i = 0; i < FADERS; i++) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 10, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x232333, roughness: 0.6 })
    );
    rail.position.x = (i - (FADERS - 1) / 2) * 2.1;
    const knob = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.5, 0.9),
      new THREE.MeshStandardMaterial({
        color: 0x10101a, emissive: i % 2 ? CYAN : PINK, emissiveIntensity: 0.8, roughness: 0.35,
      })
    );
    knob.position.x = rail.position.x;
    faders.add(rail, knob);
    faderKnobs.push(knob);
  }
  faders.position.set(12, 2, -144);
  faders.rotation.y = -0.5;
  scene.add(faders);

  /* ---------- station 3 · particle vortex sphere ---------- */
  const vortex = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(4.2, 1),
    new THREE.MeshStandardMaterial({
      color: 0x0e0620, emissive: VIOLET, emissiveIntensity: 0.55,
      roughness: 0.3, flatShading: true,
    })
  );
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(6.4, 1),
    new THREE.MeshBasicMaterial({ color: CYAN, wireframe: true, transparent: true, opacity: 0.35 })
  );
  const ORBITERS = IS_MOBILE ? 250 : 600;
  const orbGeo = new THREE.BufferGeometry();
  const orbPos = new Float32Array(ORBITERS * 3);
  for (let i = 0; i < ORBITERS; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(THREE.MathUtils.randFloat(7.5, 12));
    orbPos.set([v.x, v.y, v.z], i * 3);
  }
  orbGeo.setAttribute('position', new THREE.BufferAttribute(orbPos, 3));
  const orbiters = new THREE.Points(
    orbGeo,
    new THREE.PointsMaterial({
      size: 0.8, map: starTex, color: PINK, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending,
    })
  );
  vortex.add(core, shell, orbiters);
  vortex.position.set(-10, 3, -204);
  scene.add(vortex);

  /* ---------- station 4 · portal ---------- */
  const portal = new THREE.Group();
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(8, 0.35, 16, 100),
    new THREE.MeshStandardMaterial({ color: 0x10101a, emissive: PINK, emissiveIntensity: 1.1 })
  );
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(6.2, 0.2, 16, 100),
    new THREE.MeshStandardMaterial({ color: 0x10101a, emissive: CYAN, emissiveIntensity: 1.1 })
  );
  portal.add(ring1, ring2);
  portal.position.set(0, 3, -266);
  scene.add(portal);

  /* ---------- floating mini-vinyls scattered along the route ---------- */
  const drifters = [];
  for (let i = 0; i < (IS_MOBILE ? 4 : 8); i++) {
    const d = makeVinyl(THREE.MathUtils.randFloat(1.4, 2.6));
    d.position.set(
      THREE.MathUtils.randFloatSpread(70),
      THREE.MathUtils.randFloat(-6, 18),
      THREE.MathUtils.randFloat(-250, -20)
    );
    d.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    d.userData.spin = THREE.MathUtils.randFloat(0.15, 0.5) * (Math.random() > 0.5 ? 1 : -1);
    d.userData.bobPhase = Math.random() * Math.PI * 2;
    d.userData.baseY = d.position.y;
    scene.add(d);
    drifters.push(d);
  }

  /* ---------- camera path ---------- */
  // One waypoint per section; the camera flies the curve as you scroll.
  const camPath = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 5, 16),      // hero
      new THREE.Vector3(-6, 6, -52),    // → music
      new THREE.Vector3(10, 4, -114),   // → studio
      new THREE.Vector3(-8, 6, -172),   // → about
      new THREE.Vector3(0, 3.5, -238),  // → connect (through the portal)
    ],
    false, 'catmullrom', 0.35
  );
  // Look slightly left of each centerpiece so it frames right of the copy.
  const AIM = new THREE.Vector3(-5, 0, 0);
  const lookTargets = [
    vinyl.position.clone().add(new THREE.Vector3(-2, 0, 0)),
    eqRing.position.clone().add(AIM),
    faders.position.clone().add(AIM),
    vortex.position.clone().add(AIM),
    portal.position.clone().add(AIM),
  ];

  const camPos = new THREE.Vector3();
  const lookAt = new THREE.Vector3().copy(lookTargets[0]);

  /* ---------- render loop ---------- */
  const clock = new THREE.Clock();
  let prevT = 0;

  function animate() {
    const t = clock.getElapsedTime();
    const dt = Math.min(t - prevT || 0.016, 0.05);
    prevT = t;

    // ease scroll
    const ease = PRM ? 1 : 1 - Math.pow(0.002, dt); // framerate-independent lerp
    scrollEased += (scrollTarget - scrollEased) * ease;

    // camera along path
    camPath.getPointAt(THREE.MathUtils.clamp(scrollEased, 0, 1), camPos);

    // look target: blend between station targets
    const seg = scrollEased * (lookTargets.length - 1);
    const i0 = Math.min(Math.floor(seg), lookTargets.length - 2);
    const blend = THREE.MathUtils.smoothstep(seg - i0, 0, 1);
    lookAt.lerpVectors(lookTargets[i0], lookTargets[i0 + 1], blend);

    // idle drift + mouse parallax
    if (!PRM) {
      camPos.x += Math.sin(t * 0.4) * 0.5 + mouse.x * 2.2;
      camPos.y += Math.cos(t * 0.33) * 0.35 - mouse.y * 1.4;
    }
    camera.position.copy(camPos);
    camera.lookAt(lookAt);

    // lights ride with the camera
    keyLight.position.set(camPos.x + 14, camPos.y + 10, camPos.z - 8);
    fillLight.position.set(camPos.x - 14, camPos.y - 4, camPos.z - 16);

    // animate the world
    if (!PRM) {
      waveTerrain(t);
      vinyl.rotation.y = t * 0.5;
      eqRing.rotation.y = t * 0.12;
      for (let i = 0; i < eqBars.length; i++) {
        const h = 1.6 + (Math.sin(t * 3.1 + i * 0.55) * 0.5 + 0.5) * 6.5;
        eqBars[i].scale.y = h;
        eqBars[i].position.y = h / 2 - 2.5;
      }
      for (let i = 0; i < faderKnobs.length; i++) {
        faderKnobs[i].position.y = Math.sin(t * 1.4 + i * 0.9) * 3.6;
      }
      core.rotation.y = t * 0.4;
      shell.rotation.y = -t * 0.22;
      shell.rotation.x = t * 0.13;
      orbiters.rotation.y = t * 0.5;
      ring1.rotation.z = t * 0.3;
      ring2.rotation.z = -t * 0.45;
      ring1.rotation.y = Math.sin(t * 0.4) * 0.25;
      for (const d of drifters) {
        d.rotation.y += d.userData.spin * dt;
        d.position.y = d.userData.baseY + Math.sin(t * 0.6 + d.userData.bobPhase) * 1.4;
      }
      stars.rotation.y = t * 0.004;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  /* ---------- resize ---------- */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    readScroll();
  });
}

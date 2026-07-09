/* ============================================================
   eDouble MUSIC — deep-space scroll experience
   The camera drifts through a cinematic star system as you
   scroll: ringed planet → sound ring → constellation →
   spiral galaxy → beacon star.
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
const header = document.querySelector('.header');
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
    const dur = PRM ? 1 : 1600;
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
  header.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', readScroll, { passive: true });
readScroll();

/* Mouse parallax — subtle */
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
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04060d);
  scene.fog = new THREE.FogExp2(0x04060d, 0.0075);

  const camera = new THREE.PerspectiveCamera(
    50, window.innerWidth / window.innerHeight, 0.1, 600
  );

  const ICE = new THREE.Color(0x9db8ff);
  const AMBER = new THREE.Color(0xe6b25c);

  /* ---------- lights: one distant warm sun + cool ambience ---------- */
  const sun = new THREE.DirectionalLight(0xfff0dd, 2.6);
  sun.position.set(60, 24, 10);
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0x28355e, 0x04060d, 1.1));

  /* ---------- shared sprite textures ---------- */
  function radialSprite(stops) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    for (const [k, col] of stops) grad.addColorStop(k, col);
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  const starTex = radialSprite([
    [0, 'rgba(255,255,255,1)'], [0.3, 'rgba(255,255,255,0.45)'], [1, 'rgba(255,255,255,0)'],
  ]);
  const softTex = radialSprite([
    [0, 'rgba(255,255,255,0.9)'], [0.5, 'rgba(255,255,255,0.22)'], [1, 'rgba(255,255,255,0)'],
  ]);

  /* ---------- starfield: two depth layers ---------- */
  function makeStars(count, spread, size, color, opacity) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = THREE.MathUtils.randFloatSpread(spread[0]);
      pos[i * 3 + 1] = THREE.MathUtils.randFloatSpread(spread[1]);
      pos[i * 3 + 2] = THREE.MathUtils.randFloat(-360, 60);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      size, map: starTex, color, transparent: true, opacity,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    }));
  }
  const starsFar = makeStars(IS_MOBILE ? 1600 : 4200, [420, 260], 0.7, 0xbfceff, 0.55);
  const starsNear = makeStars(IS_MOBILE ? 300 : 700, [260, 160], 1.6, 0xe8eeff, 0.8);
  scene.add(starsFar, starsNear);

  /* ---------- nebula haze: huge soft sprites, far behind ---------- */
  const nebulaSpecs = [
    { color: 0x101c42, s: 220, p: [-80, 30, -180], o: 0.16 },
    { color: 0x0c1430, s: 260, p: [90, -10, -240], o: 0.18 },
    { color: 0x14204a, s: 170, p: [30, 50, -120], o: 0.12 },
    { color: 0x241a2e, s: 200, p: [-60, -30, -290], o: 0.14 },
    { color: 0x0e1836, s: 240, p: [70, 40, -330], o: 0.16 },
  ];
  for (const n of nebulaSpecs) {
    const m = new THREE.SpriteMaterial({
      map: softTex, color: n.color, transparent: true, opacity: n.o,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const sp = new THREE.Sprite(m);
    sp.scale.setScalar(n.s);
    sp.position.set(...n.p);
    scene.add(sp);
  }

  /* ---------- station 0 · ringed planet ---------- */
  const planet = new THREE.Group();

  // subtle procedural surface
  function planetTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#151d31';
    g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 340; i++) {
      const r = Math.random() * 46 + 8;
      const grad = g.createRadialGradient(0, 0, 0, 0, 0, r);
      const dark = Math.random() > 0.5;
      grad.addColorStop(0, dark ? 'rgba(9,12,22,0.34)' : 'rgba(38,50,84,0.20)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.save();
      g.translate(Math.random() * 512, Math.random() * 256);
      g.scale(1 + Math.random() * 1.6, 1);
      g.fillStyle = grad;
      g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const PLANET_R = 11;
  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_R, IS_MOBILE ? 48 : 72, IS_MOBILE ? 32 : 48),
    new THREE.MeshStandardMaterial({
      map: planetTexture(), roughness: 0.92, metalness: 0.05,
    })
  );
  planet.add(surface);

  // atmospheric rim (fresnel, additive)
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_R * 1.045, 48, 32),
    new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: ICE.clone() } },
      vertexShader: /* glsl */`
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 glowColor;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.2);
          gl_FragColor = vec4(glowColor, rim * 0.85);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  planet.add(atmosphere);

  // halo sprite behind the planet
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: softTex, color: 0x33477f, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  halo.scale.setScalar(PLANET_R * 4.6);
  planet.add(halo);

  // ring system: two flat rings + dust particles
  const ringGroup = new THREE.Group();
  function flatRing(rIn, rOut, opacity) {
    const geo = new THREE.RingGeometry(rIn, rOut, 128);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x8fa5d8, transparent: true, opacity,
      side: THREE.DoubleSide, depthWrite: false, toneMapped: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  }
  ringGroup.add(flatRing(PLANET_R * 1.5, PLANET_R * 1.56, 0.34));
  ringGroup.add(flatRing(PLANET_R * 1.62, PLANET_R * 1.98, 0.1));
  ringGroup.add(flatRing(PLANET_R * 2.04, PLANET_R * 2.07, 0.2));

  const DUST = IS_MOBILE ? 900 : 2200;
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = PLANET_R * THREE.MathUtils.randFloat(1.48, 2.1);
    dustPos[i * 3] = Math.cos(a) * r;
    dustPos[i * 3 + 1] = THREE.MathUtils.randFloatSpread(0.35);
    dustPos[i * 3 + 2] = Math.sin(a) * r;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.35, map: starTex, color: 0xaebede, transparent: true, opacity: 0.75,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  ringGroup.add(dust);
  planet.add(ringGroup);

  planet.position.set(15, -3, -30);
  planet.rotation.z = 0.14;
  ringGroup.rotation.x = 0.42;
  scene.add(planet);

  /* ---------- station 1 · sound ring (circular waveform) ---------- */
  const SOUND_BARS = 96;
  const soundRing = new THREE.Group();
  const soundBars = [];
  for (let i = 0; i < SOUND_BARS; i++) {
    const isAccent = i % 16 === 0;
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.075, 1, 0.075),
      new THREE.MeshBasicMaterial({
        color: isAccent ? AMBER : ICE,
        transparent: true,
        opacity: isAccent ? 0.95 : 0.62,
        toneMapped: false,
      })
    );
    const a = (i / SOUND_BARS) * Math.PI * 2;
    bar.position.set(Math.cos(a) * 10, 0, Math.sin(a) * 10);
    bar.userData.phase = a * 3;
    soundRing.add(bar);
    soundBars.push(bar);
  }
  // faint guide circle
  const guide = new THREE.Mesh(
    new THREE.TorusGeometry(10, 0.012, 8, 128),
    new THREE.MeshBasicMaterial({ color: ICE, transparent: true, opacity: 0.22, toneMapped: false })
  );
  guide.rotation.x = Math.PI / 2;
  soundRing.add(guide);
  soundRing.position.set(-11, 2, -100);
  soundRing.rotation.x = 0.18;
  scene.add(soundRing);

  /* ---------- station 2 · constellation ---------- */
  const constellation = new THREE.Group();
  const NODES = 16;
  const nodePts = [];
  for (let i = 0; i < NODES; i++) {
    nodePts.push(new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(15),
      THREE.MathUtils.randFloatSpread(10),
      THREE.MathUtils.randFloatSpread(9)
    ));
  }
  // connect each node to its 2 nearest neighbours
  const linePos = [];
  const seen = new Set();
  for (let i = 0; i < NODES; i++) {
    const dists = nodePts
      .map((p, j) => ({ j, d: p.distanceTo(nodePts[i]) }))
      .filter((e) => e.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const { j } of dists) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      linePos.push(...nodePts[i].toArray(), ...nodePts[j].toArray());
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  constellation.add(new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({ color: 0x7d94cf, transparent: true, opacity: 0.36, toneMapped: false })
  ));
  const nodeGeo = new THREE.BufferGeometry().setFromPoints(nodePts);
  constellation.add(new THREE.Points(nodeGeo, new THREE.PointsMaterial({
    size: 1.5, map: starTex, color: 0xdfe8ff, transparent: true,
    depthWrite: false, blending: THREE.AdditiveBlending,
  })));
  // one amber "north star"
  const north = new THREE.Sprite(new THREE.SpriteMaterial({
    map: starTex, color: AMBER, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  north.scale.setScalar(3.4);
  north.position.copy(nodePts[0]);
  constellation.add(north);
  constellation.position.set(13, 3, -168);
  scene.add(constellation);

  /* ---------- station 3 · spiral galaxy ---------- */
  const GALAXY_N = IS_MOBILE ? 4200 : 10000;
  const gPos = new Float32Array(GALAXY_N * 3);
  const gCol = new Float32Array(GALAXY_N * 3);
  const inC = new THREE.Color(0xffe3b0);
  const outC = new THREE.Color(0x6f97ff);
  const BRANCHES = 4, RADIUS = 17, SPIN = 1.25, RPOW = 2.6, RAND = 0.34;
  for (let i = 0; i < GALAXY_N; i++) {
    const r = Math.pow(Math.random(), 1.6) * RADIUS;
    const branch = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
    const spin = r * SPIN * 0.25;
    const rx = Math.pow(Math.random(), RPOW) * (Math.random() < 0.5 ? 1 : -1) * RAND * r;
    const ry = Math.pow(Math.random(), RPOW) * (Math.random() < 0.5 ? 1 : -1) * RAND * r * 0.5;
    const rz = Math.pow(Math.random(), RPOW) * (Math.random() < 0.5 ? 1 : -1) * RAND * r;
    gPos[i * 3] = Math.cos(branch + spin) * r + rx;
    gPos[i * 3 + 1] = ry;
    gPos[i * 3 + 2] = Math.sin(branch + spin) * r + rz;
    const c = inC.clone().lerp(outC, Math.min(r / RADIUS + 0.08, 1));
    gCol[i * 3] = c.r; gCol[i * 3 + 1] = c.g; gCol[i * 3 + 2] = c.b;
  }
  const galaxyGeo = new THREE.BufferGeometry();
  galaxyGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
  galaxyGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3));
  const galaxy = new THREE.Points(galaxyGeo, new THREE.PointsMaterial({
    size: 0.14, map: starTex, vertexColors: true, transparent: true, opacity: 0.95,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  }));
  const galaxyCore = new THREE.Sprite(new THREE.SpriteMaterial({
    map: softTex, color: 0xffe9c4, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  galaxyCore.scale.setScalar(7);
  const galaxyGroup = new THREE.Group();
  galaxyGroup.add(galaxy, galaxyCore);
  galaxyGroup.position.set(-13, 3, -238);
  galaxyGroup.rotation.set(0.55, 0, 0.18);
  scene.add(galaxyGroup);

  /* ---------- station 4 · beacon star ---------- */
  const beacon = new THREE.Group();
  const beaconGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: softTex, color: 0xbcd0ff, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  beaconGlow.scale.setScalar(20);
  const beaconCore = new THREE.Sprite(new THREE.SpriteMaterial({
    map: starTex, color: 0xffffff, transparent: true, opacity: 1,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  beaconCore.scale.setScalar(6);
  const flare = new THREE.Sprite(new THREE.SpriteMaterial({
    map: softTex, color: 0x9db8ff, transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  flare.scale.set(56, 0.7, 1);
  const beaconRing = new THREE.Mesh(
    new THREE.TorusGeometry(6.5, 0.02, 8, 128),
    new THREE.MeshBasicMaterial({ color: ICE, transparent: true, opacity: 0.4, toneMapped: false })
  );
  beaconRing.rotation.set(1.15, 0.45, 0);
  beacon.add(beaconGlow, beaconCore, flare, beaconRing);
  beacon.position.set(0, 3, -305);
  scene.add(beacon);

  /* ---------- drifting rocks for near-field parallax ---------- */
  const rocks = [];
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x1c2438, roughness: 0.9, flatShading: true });
  for (let i = 0; i < (IS_MOBILE ? 5 : 10); i++) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(THREE.MathUtils.randFloat(0.35, 1.1), 0), rockMat
    );
    rock.position.set(
      THREE.MathUtils.randFloatSpread(80),
      THREE.MathUtils.randFloat(-14, 20),
      THREE.MathUtils.randFloat(-290, -10)
    );
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    rock.userData.spin = THREE.MathUtils.randFloat(0.05, 0.22);
    scene.add(rock);
    rocks.push(rock);
  }

  /* ---------- camera path ---------- */
  const camPath = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 4, 20),      // hero
      new THREE.Vector3(-6, 6, -64),    // → music
      new THREE.Vector3(8, 3, -132),    // → studio
      new THREE.Vector3(-8, 6, -202),   // → about
      new THREE.Vector3(0, 3, -272),    // → connect
    ],
    false, 'catmullrom', 0.4
  );
  // Aim slightly left of each centerpiece so it frames right of the copy.
  const lookTargets = [
    new THREE.Vector3(8, -2, -30),
    soundRing.position.clone().add(new THREE.Vector3(-5, 0, 0)),
    constellation.position.clone().add(new THREE.Vector3(-6, 0, 0)),
    galaxyGroup.position.clone().add(new THREE.Vector3(-6, 0, 0)),
    beacon.position.clone().add(new THREE.Vector3(-4, 0, 0)),
  ];

  const camPos = new THREE.Vector3();
  const lookAt = new THREE.Vector3().copy(lookTargets[0]);

  /* ---------- per-station fade: each centerpiece only appears near its section ---------- */
  const stations = [
    { group: soundRing, idx: 1 },
    { group: constellation, idx: 2 },
    { group: galaxyGroup, idx: 3 },
    { group: beacon, idx: 4 },
  ];
  for (const s of stations) {
    s.mats = [];
    s.group.traverse((o) => {
      if (o.material) {
        o.material.transparent = true;
        s.mats.push([o.material, o.material.opacity]);
      }
    });
  }

  /* ---------- render loop ---------- */
  const clock = new THREE.Clock();
  let prevT = 0;

  function animate() {
    const t = clock.getElapsedTime();
    const dt = Math.min(t - prevT || 0.016, 0.05);
    prevT = t;

    // ease scroll (framerate-independent)
    const ease = PRM ? 1 : 1 - Math.pow(0.004, dt);
    scrollEased += (scrollTarget - scrollEased) * ease;

    camPath.getPointAt(THREE.MathUtils.clamp(scrollEased, 0, 1), camPos);

    const seg = scrollEased * (lookTargets.length - 1);
    const i0 = Math.min(Math.floor(seg), lookTargets.length - 2);
    const blend = THREE.MathUtils.smoothstep(seg - i0, 0, 1);
    lookAt.lerpVectors(lookTargets[i0], lookTargets[i0 + 1], blend);

    if (!PRM) {
      camPos.x += Math.sin(t * 0.22) * 0.5 + mouse.x * 1.3;
      camPos.y += Math.cos(t * 0.18) * 0.35 - mouse.y * 0.9;
    }
    camera.position.copy(camPos);
    camera.lookAt(lookAt);

    const segPos = scrollEased * (lookTargets.length - 1);
    for (const s of stations) {
      const f = THREE.MathUtils.clamp((1.0 - Math.abs(segPos - s.idx)) / 0.5, 0, 1);
      s.group.visible = f > 0.02;
      if (s.group.visible) for (const [m, base] of s.mats) m.opacity = base * f;
    }

    if (!PRM) {
      surface.rotation.y = t * 0.05;
      ringGroup.rotation.z = t * 0.02;

      soundRing.rotation.y = t * 0.07;
      for (let i = 0; i < soundBars.length; i++) {
        const b = soundBars[i];
        b.scale.y = 1.1 +
          (Math.sin(t * 1.7 + b.userData.phase) * 0.5 + 0.5) * 2.2 +
          (Math.sin(t * 3.3 + i * 0.9) * 0.5 + 0.5) * 0.5;
      }

      constellation.rotation.y = t * 0.05;

      galaxy.rotation.y = t * 0.04;

      beaconRing.rotation.z = t * 0.12;

      for (const r of rocks) {
        r.rotation.y += r.userData.spin * dt;
        r.rotation.x += r.userData.spin * 0.6 * dt;
      }
      starsNear.rotation.z = t * 0.003;
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

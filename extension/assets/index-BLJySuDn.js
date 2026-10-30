var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key2, value) => key2 in obj ? __defProp(obj, key2, { enumerable: true, configurable: true, writable: true, value }) : obj[key2] = value;
var __publicField = (obj, key2, value) => __defNormalProp(obj, typeof key2 !== "symbol" ? key2 + "" : key2, value);
var _a;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
const rand = (lo, hi) => lo + Math.random() * (hi - lo);
const randInt = (lo, hi) => Math.floor(rand(lo, hi + 1));
function smoothstep(e0, e1, x) {
  const t2 = clamp((x - e0) / (e1 - e0), 0, 1);
  return t2 * t2 * (3 - 2 * t2);
}
function angleDiff(a, b) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}
function hash3(x, y, z) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1442695041);
  h = Math.imul(h ^ h >>> 13, 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const K1 = 1 / 260;
const K2 = 1 / 310;
const K3 = 1 / 190;
const CURRENT_SCALE = 3400;
function current(x, y, t2, out) {
  const a = x * K1 + t2 * 0.07;
  const b = y * K2 - t2 * 0.05;
  const c = (x + y) * K3 + t2 * 0.11;
  out.x = (-K2 * Math.sin(a) * Math.sin(b) + 0.5 * K3 * Math.cos(c)) * CURRENT_SCALE;
  out.y = (-K1 * Math.cos(a) * Math.cos(b) - 0.5 * K3 * Math.cos(c)) * CURRENT_SCALE;
  return out;
}
const SPECIES = [
  {
    name: "sardine",
    cruise: 36,
    maxSpeed: 64,
    minSpeed: 18,
    weight: 3,
    schoolSize: [18, 28],
    spacing: [1.8, 1.1],
    align: 1.6,
    cohesion: 1.6,
    jitter: 40,
    mill: 70,
    verticalDrag: 0.5
  },
  {
    name: "anchovy",
    cruise: 46,
    maxSpeed: 78,
    minSpeed: 22,
    weight: 3,
    schoolSize: [20, 32],
    spacing: [1.5, 1],
    align: 3.2,
    cohesion: 0.45,
    jitter: 30,
    mill: 0,
    verticalDrag: 1.4
  },
  {
    name: "silverside",
    cruise: 40,
    maxSpeed: 70,
    minSpeed: 20,
    weight: 3,
    schoolSize: [12, 20],
    spacing: [2, 1.1],
    align: 2.4,
    cohesion: 1.1,
    jitter: 35,
    mill: 0,
    verticalDrag: 1.6
  },
  {
    name: "mackerel",
    cruise: 32,
    maxSpeed: 60,
    minSpeed: 16,
    weight: 2,
    schoolSize: [5, 9],
    spacing: [2.6, 1.3],
    align: 2,
    cohesion: 0.9,
    jitter: 25,
    mill: 0,
    verticalDrag: 2
  },
  {
    name: "goby",
    cruise: 26,
    maxSpeed: 56,
    minSpeed: 10,
    weight: 1,
    schoolSize: [8, 12],
    spacing: [1.4, 1.1],
    align: 0.35,
    cohesion: 1.4,
    jitter: 110,
    mill: 0,
    verticalDrag: 0.3
  }
];
const TOTAL_WEIGHT = SPECIES.reduce((sum, s) => sum + s.weight, 0);
function pickSpecies() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (let i = 0; i < SPECIES.length; i++) {
    r -= SPECIES[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}
const SHARK_NODES = 20;
const DEFAULT_SHARKS = [
  { kind: "classic", size: 1 },
  { kind: "classic", size: 0.7 },
  { kind: "classic", size: 0.84 },
  { kind: "classic", size: 0.77 }
];
const RIPPLE_SPEED = 51;
const RIPPLE_LIFE = 2.2;
const RIPPLE_RINGS = 3;
const RIPPLE_FRONT = 14;
const RIPPLE_PUSH = 320;
const FISH_SEPARATION_K = 420;
const FISH_ALIGN_K = 1.4;
const FISH_COHESION_K = 1;
const FISH_FLEE_K = 1100;
const BLIND_COS = -0.6;
class World {
  /** fishCount overrides the area-based population (the sidebar wants a single small school). */
  constructor(sharkSpecs = DEFAULT_SHARKS, fishCount, fishScale = 1) {
    __publicField(this, "width", 0);
    __publicField(this, "height", 0);
    __publicField(this, "time", 0);
    __publicField(this, "fish", []);
    __publicField(this, "sharks", []);
    __publicField(this, "events", []);
    __publicField(this, "pointer", { x: 0, y: 0, active: false });
    __publicField(this, "splashes", []);
    /** Fish neighbourhood radius; the spatial hash bucket size matches it. */
    __publicField(this, "perception", 60);
    /** Per-species personal space in px (x, y). */
    __publicField(this, "sepX", []);
    __publicField(this, "sepY", []);
    __publicField(this, "foreignSep", 40);
    __publicField(this, "bucketCols", 0);
    __publicField(this, "bucketRows", 0);
    __publicField(this, "bucketHead", new Int32Array(0));
    __publicField(this, "bucketCount", new Uint16Array(0));
    __publicField(this, "bucketNext", new Int32Array(0));
    __publicField(this, "lastSpawn", 0);
    __publicField(this, "tmp", { x: 0, y: 0 });
    /** Scales the population so fish per cell stays the same as glyphs shrink or grow. */
    __publicField(this, "density", 1);
    this.sharkSpecs = sharkSpecs;
    this.fishCount = fishCount;
    this.fishScale = fishScale;
  }
  /** refCellArea is the cell size the population is tuned for; smaller cells get more fish. */
  resize(width, height, cellW, cellH, refCellArea = cellW * cellH) {
    const first = this.width === 0;
    this.width = width;
    this.height = height;
    this.density = refCellArea / (cellW * cellH);
    this.sepX = SPECIES.map((sp) => sp.spacing[0] * cellW);
    this.sepY = SPECIES.map((sp) => sp.spacing[1] * cellH);
    this.perception = Math.max(cellH * 3, cellW * 5.5);
    this.foreignSep = cellW * 3;
    if (first || this.fish.length === 0) {
      this.seed();
      return;
    }
    for (const f of this.fish) {
      f.x = clamp(f.x, 0, width);
      f.y = clamp(f.y, 0, height);
    }
  }
  seed() {
    const { width: W, height: H } = this;
    const minSide = Math.min(W, H);
    const baseLength = clamp(minSide * 0.44, 170, 430);
    const sharkCount = this.sharkSpecs.length;
    this.sharks = [];
    for (let i = 0; i < sharkCount; i++) {
      const { kind, size } = this.sharkSpecs[i];
      const length = baseLength * size;
      const orbitRadius = minSide * rand(0.28, 0.4);
      const a = i / sharkCount * TAU + rand(-0.4, 0.4);
      const orbitDir = i % 2 === 0 ? 1 : -1;
      const x = W / 2 + Math.cos(a) * orbitRadius * (W / minSide) * 0.9;
      const y = H / 2 + Math.sin(a) * orbitRadius;
      const heading = a + orbitDir * Math.PI / 2;
      const nodes = new Float32Array(SHARK_NODES * 2);
      const seg = length / (SHARK_NODES - 1);
      for (let n = 0; n < SHARK_NODES; n++) {
        nodes[n * 2] = x - Math.cos(heading) * seg * n;
        nodes[n * 2 + 1] = y - Math.sin(heading) * seg * n;
      }
      this.sharks.push({
        id: i + 1,
        kind,
        length,
        nodes,
        heading,
        speed: 30,
        phase: rand(0, TAU),
        turn: 0,
        hunger: rand(0.25, 0.75),
        wander: 0,
        orbitDir,
        orbitRadius,
        target: null,
        retargetAt: 0,
        depth: size
      });
    }
    this.sharks.sort((a, b) => a.length - b.length);
    const total = this.fishCount ?? Math.round(clamp(Math.round(W * H / 4400), 85, 340) * this.fishScale * this.density);
    this.fish = [];
    while (this.fish.length < total) {
      const species = pickSpecies();
      const sp = SPECIES[species];
      const size = Math.min(randInt(sp.schoolSize[0], sp.schoolSize[1]), total - this.fish.length);
      const millDir = Math.random() < 0.5 ? 1 : -1;
      const cx = rand(W * 0.06, W * 0.94);
      const cy = rand(H * 0.08, H * 0.92);
      const dir = (Math.random() < 0.5 ? 0 : Math.PI) + rand(-0.5, 0.5);
      for (let k = 0; k < size; k++) {
        this.fish.push({
          x: cx + rand(-1, 1) * this.sepX[species] * Math.sqrt(size),
          y: cy + rand(-1, 1) * this.sepY[species] * Math.sqrt(size) * 0.6,
          vx: Math.cos(dir) * sp.cruise,
          vy: Math.sin(dir) * sp.cruise,
          species,
          alarm: 0,
          alive: true,
          respawnAt: 0,
          phase: rand(0, TAU),
          turn: 0,
          depth: rand(0.55, 1),
          millDir
        });
      }
    }
    this.bucketNext = new Int32Array(this.fish.length);
  }
  splash(x, y) {
    this.events.push({ kind: "splash", x, y });
    this.splashes.push({ x, y, born: this.time });
  }
  /** Fish caught by a ripple's leading ring bolt outward with it. */
  stepSplashes(dt) {
    const { time } = this;
    this.splashes = this.splashes.filter((sp) => time - sp.born < RIPPLE_LIFE);
    for (const sp of this.splashes) {
      const age = time - sp.born;
      const front = age * RIPPLE_SPEED;
      const k = (1 - age / RIPPLE_LIFE) * RIPPLE_PUSH * dt;
      for (const f of this.fish) {
        if (!f.alive) continue;
        const dx = f.x - sp.x;
        const dy = f.y - sp.y;
        const d = Math.hypot(dx, dy);
        if (d < 1e-3 || Math.abs(d - front) > RIPPLE_FRONT) continue;
        f.vx += dx / d * k;
        f.vy += dy / d * k;
        f.alarm = 1;
      }
    }
  }
  step(dt) {
    this.time += dt;
    this.rebuildHash();
    this.stepSplashes(dt);
    this.stepFish(dt);
    this.stepSharks(dt);
    this.respawn();
  }
  rebuildHash() {
    const size = this.perception;
    const pad = 2;
    this.bucketCols = Math.ceil(this.width / size) + pad * 2;
    this.bucketRows = Math.ceil(this.height / size) + pad * 2;
    const n = this.bucketCols * this.bucketRows;
    if (this.bucketHead.length !== n) {
      this.bucketHead = new Int32Array(n);
      this.bucketCount = new Uint16Array(n);
    }
    this.bucketHead.fill(-1);
    this.bucketCount.fill(0);
    if (this.bucketNext.length !== this.fish.length) {
      this.bucketNext = new Int32Array(this.fish.length);
    }
    for (let i = 0; i < this.fish.length; i++) {
      const f = this.fish[i];
      if (!f.alive) continue;
      const b = this.bucketOf(f.x, f.y);
      this.bucketNext[i] = this.bucketHead[b];
      this.bucketHead[b] = i;
      this.bucketCount[b]++;
    }
  }
  bucketOf(x, y) {
    const size = this.perception;
    const c = clamp(Math.floor(x / size) + 2, 0, this.bucketCols - 1);
    const r = clamp(Math.floor(y / size) + 2, 0, this.bucketRows - 1);
    return r * this.bucketCols + c;
  }
  stepFish(dt) {
    const { fish, sharks, pointer, width: W, height: H, time } = this;
    const R = this.perception;
    const R2 = R * R;
    const foreignSep = this.foreignSep;
    const size = this.perception;
    const cols = this.bucketCols;
    const rows = this.bucketRows;
    const head = this.bucketHead;
    const next = this.bucketNext;
    const cur = this.tmp;
    const calmDecay = Math.exp(-dt * 0.7);
    const contagion = Math.min(1, dt * 6);
    for (let i = 0; i < fish.length; i++) {
      const f = fish[i];
      if (!f.alive) continue;
      const sp = SPECIES[f.species];
      const spread = 1 + 1.8 * f.alarm;
      const sepX = this.sepX[f.species] * spread;
      const sepY = this.sepY[f.species] * spread;
      const speed = Math.hypot(f.vx, f.vy) || 1;
      const hx = f.vx / speed;
      const hy = f.vy / speed;
      let ax = 0;
      let ay = 0;
      let sx = 0;
      let sy = 0;
      let avx = 0;
      let avy = 0;
      let cx = 0;
      let cy = 0;
      let n = 0;
      let neighbourAlarm = 0;
      const bc = clamp(Math.floor(f.x / size) + 2, 0, cols - 1);
      const br = clamp(Math.floor(f.y / size) + 2, 0, rows - 1);
      for (let r = Math.max(0, br - 1); r <= Math.min(rows - 1, br + 1); r++) {
        for (let c = Math.max(0, bc - 1); c <= Math.min(cols - 1, bc + 1); c++) {
          let j = head[r * cols + c];
          while (j !== -1) {
            if (j !== i) {
              const o = fish[j];
              const dx = o.x - f.x;
              const dy = o.y - f.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < R2 && d2 > 1e-6) {
                const d = Math.sqrt(d2);
                if ((dx * hx + dy * hy) / d > BLIND_COS) {
                  const qx = dx / sepX;
                  const qy = dy / sepY;
                  const q2 = qx * qx + qy * qy;
                  if (q2 < 1) {
                    const q = Math.sqrt(q2) || 1e-3;
                    const k = (1 - q) / q;
                    sx -= qx * k;
                    sy -= qy * k;
                  }
                  if (o.species === f.species) {
                    avx += o.vx;
                    avy += o.vy;
                    cx += dx;
                    cy += dy;
                    n++;
                  } else if (d < foreignSep) {
                    const k = (1 - d / foreignSep) / d * 0.6;
                    sx -= dx * k;
                    sy -= dy * k;
                  }
                  if (o.alarm > neighbourAlarm) neighbourAlarm = o.alarm;
                }
              }
            }
            j = next[j];
          }
        }
      }
      ax += sx * FISH_SEPARATION_K;
      ay += sy * FISH_SEPARATION_K;
      if (n > 0) {
        const alignK = FISH_ALIGN_K * sp.align;
        const cohesionK = FISH_COHESION_K * sp.cohesion * (1 - 0.8 * f.alarm);
        ax += (avx / n - f.vx) * alignK + cx / n * cohesionK;
        ay += (avy / n - f.vy) * alignK + cy / n * cohesionK;
        if (sp.mill > 0) {
          const cl = Math.hypot(cx, cy) || 1;
          ax += -cy / cl * f.millDir * sp.mill * (1 - f.alarm);
          ay += cx / cl * f.millDir * sp.mill * (1 - f.alarm);
        }
      }
      let fear = 0;
      for (const sh of sharks) {
        const fearR = sh.length * 0.6 + 60;
        let best = Infinity;
        let bx = 0;
        let by = 0;
        for (let k = 0; k <= 12; k += 3) {
          const nx = sh.nodes[k * 2];
          const ny = sh.nodes[k * 2 + 1];
          const d2 = (f.x - nx) ** 2 + (f.y - ny) ** 2;
          if (d2 < best) {
            best = d2;
            bx = nx;
            by = ny;
          }
        }
        const d = Math.sqrt(best);
        if (d >= fearR || d < 1e-3) continue;
        let w = 1 - d / fearR;
        w *= w;
        const awayX = (f.x - bx) / d;
        const awayY = (f.y - by) / d;
        const shx = Math.cos(sh.heading);
        const shy = Math.sin(sh.heading);
        const side = shx * (f.y - sh.nodes[1]) - shy * (f.x - sh.nodes[0]) >= 0 ? 1 : -1;
        ax += (awayX * 0.7 - shy * side * 0.9) * FISH_FLEE_K * w;
        ay += (awayY * 0.7 + shx * side * 0.9) * FISH_FLEE_K * w;
        fear = Math.max(fear, Math.sqrt(w));
      }
      if (pointer.active) {
        const pr = 130;
        const dx = f.x - pointer.x;
        const dy = f.y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < pr && d > 1e-3) {
          const w = (1 - d / pr) ** 2;
          ax += dx / d * FISH_FLEE_K * w;
          ay += dy / d * FISH_FLEE_K * w;
          fear = Math.max(fear, Math.sqrt(w) * 0.8);
        }
      }
      let alarm = Math.max(f.alarm * calmDecay, fear);
      const relayed = neighbourAlarm * 0.86;
      if (relayed > alarm) alarm += (relayed - alarm) * contagion;
      f.alarm = alarm;
      const m = 36;
      if (f.x < m) ax += (m - f.x) * 7;
      else if (f.x > W - m) ax -= (f.x - (W - m)) * 7;
      if (f.y < m) ay += (m - f.y) * 7;
      else if (f.y > H - m) ay -= (f.y - (H - m)) * 7;
      current(f.x, f.y, time, cur);
      ax += cur.x * 0.5 + (Math.random() - 0.5) * sp.jitter;
      ay += cur.y * 0.5 + (Math.random() - 0.5) * sp.jitter;
      ay -= f.vy * sp.verticalDrag * (1 - 0.7 * f.alarm);
      const preferred = sp.cruise * (1 + 1.3 * f.alarm);
      ax += (preferred - speed) * hx * 1.6;
      ay += (preferred - speed) * hy * 1.6;
      const before = Math.atan2(f.vy, f.vx);
      f.vx += ax * dt;
      f.vy += ay * dt;
      const maxSpeed = sp.maxSpeed * (1 + 1.8 * f.alarm);
      const s = Math.hypot(f.vx, f.vy);
      if (s > maxSpeed) {
        f.vx *= maxSpeed / s;
        f.vy *= maxSpeed / s;
      } else if (s < sp.minSpeed && s > 1e-3) {
        f.vx *= sp.minSpeed / s;
        f.vy *= sp.minSpeed / s;
      }
      f.turn += (angleDiff(before, Math.atan2(f.vy, f.vx)) / dt - f.turn) * Math.min(1, dt * 8);
      f.phase += dt * (7 + Math.hypot(f.vx, f.vy) * 0.12);
      f.x = clamp(f.x + f.vx * dt, -60, W + 60);
      f.y = clamp(f.y + f.vy * dt, -60, H + 60);
    }
  }
  stepSharks(dt) {
    const { sharks, width: W, height: H, time } = this;
    const minSide = Math.min(W, H);
    const cxW = W / 2;
    const cyW = H / 2;
    for (const sh of sharks) {
      const L = sh.length;
      const nodes = sh.nodes;
      const hx = nodes[0];
      const hy = nodes[1];
      sh.hunger = Math.min(1, sh.hunger + dt * 0.03);
      let dx = Math.cos(sh.heading);
      let dy = Math.sin(sh.heading);
      sh.wander = clamp(sh.wander + (Math.random() - 0.5) * dt * 3.2, -1.1, 1.1);
      dx += Math.cos(sh.heading + sh.wander) * 0.45;
      dy += Math.sin(sh.heading + sh.wander) * 0.45;
      if (time >= sh.retargetAt) {
        sh.target = this.findPrey(sh);
        sh.retargetAt = time + 0.45;
      }
      const t2 = sh.target;
      let hunting = false;
      let closing = 0;
      if (t2 && t2.alive && sh.hunger > 0.3) {
        const tx = t2.x + t2.vx * 0.35 - hx;
        const ty = t2.y + t2.vy * 0.35 - hy;
        const d = Math.hypot(tx, ty) || 1;
        const w = 1.4 + 2.6 * sh.hunger;
        dx += tx / d * w;
        dy += ty / d * w;
        hunting = true;
        closing = clamp(1 - d / (L * 0.9), 0, 1);
      } else {
        const rx = (hx - cxW) / (W / minSide);
        const ry = hy - cyW;
        const r = Math.hypot(rx, ry) || 1;
        const radius = sh.orbitRadius * (1 + 0.15 * Math.sin(time * 0.05 + sh.id));
        const radial = clamp((radius - r) / radius, -1, 1);
        dx += (-ry / r * sh.orbitDir + rx / r * radial * 0.9) * 0.55;
        dy += (rx / r * sh.orbitDir + ry / r * radial * 0.9) * 0.55;
      }
      for (const other of sharks) {
        if (other === sh) continue;
        for (let k = 0; k < SHARK_NODES; k += 4) {
          const ox = hx - other.nodes[k * 2];
          const oy = hy - other.nodes[k * 2 + 1];
          const d = Math.hypot(ox, oy);
          const range = (L + other.length) * 0.45;
          if (d < range && d > 1e-3) {
            const w = (1 - d / range) * 3;
            dx += ox / d * w;
            dy += oy / d * w;
          }
        }
      }
      const ex = (hx - cxW) / (W * 0.3);
      const ey = (hy - cyW) / (H * 0.16);
      const e2 = ex * ex + ey * ey;
      if (e2 < 1) {
        const e = Math.sqrt(e2) || 1e-3;
        const w = (1 - e) * (hunting ? 1 : 2.5);
        dx += ex / e * w;
        dy += ey / e * w;
      }
      const over = Math.max(-hx, hx - W, -hy, hy - H);
      if (over > -L * 0.05) {
        const w = clamp((over + L * 0.05) / (L * 0.35), 0, 1) * 3.5;
        const toX = cxW - hx;
        const toY = cyW - hy;
        const d = Math.hypot(toX, toY) || 1;
        dx += toX / d * w;
        dy += toY / d * w;
      }
      const desired = Math.atan2(dy, dx);
      const agility = Math.min(hunting ? 1.7 + closing : 0.8, sh.speed / (L * 0.22));
      const maxTurn = agility * dt;
      const turned = clamp(angleDiff(sh.heading, desired), -maxTurn, maxTurn);
      sh.heading += turned;
      sh.turn += (turned / dt - sh.turn) * Math.min(1, dt * 3);
      const cruise = 30 + L * 0.04;
      const targetSpeed = hunting ? cruise * (1.45 + closing * 1.5) : cruise;
      sh.speed += (targetSpeed - sh.speed) * Math.min(1, dt * 1.1);
      sh.phase += dt * (2 + sh.speed / 24);
      nodes[0] += Math.cos(sh.heading) * sh.speed * dt;
      nodes[1] += Math.sin(sh.heading) * sh.speed * dt;
      const seg = L / (SHARK_NODES - 1);
      const maxBend = 0.16;
      let prevAngle = sh.heading + Math.PI;
      for (let k = 1; k < SHARK_NODES; k++) {
        const px = nodes[(k - 1) * 2];
        const py = nodes[(k - 1) * 2 + 1];
        let angle = Math.atan2(nodes[k * 2 + 1] - py, nodes[k * 2] - px);
        angle = prevAngle + clamp(angleDiff(prevAngle, angle), -maxBend, maxBend);
        nodes[k * 2] = px + Math.cos(angle) * seg;
        nodes[k * 2 + 1] = py + Math.sin(angle) * seg;
        prevAngle = angle;
      }
      if (sh.hunger > 0.15) {
        const mouthR = L * 0.05 + 8;
        const mx = nodes[0];
        const my = nodes[1];
        for (const f of this.fish) {
          if (!f.alive) continue;
          if ((f.x - mx) ** 2 + (f.y - my) ** 2 < mouthR * mouthR) {
            f.alive = false;
            f.respawnAt = time + rand(3, 8);
            sh.hunger = Math.max(0, sh.hunger - 0.16);
            this.events.push({ kind: "eat", x: f.x, y: f.y });
          }
        }
      }
    }
  }
  /**
   * Pick prey in the shark's forward cone, preferring close fish in sparse
   * buckets (stragglers) over fish buried in a dense school.
   */
  findPrey(sh) {
    const range = sh.length * 0.9 + 160;
    const hx = sh.nodes[0];
    const hy = sh.nodes[1];
    const fx = Math.cos(sh.heading);
    const fy = Math.sin(sh.heading);
    let best = null;
    let bestScore = Infinity;
    let currentScore = Infinity;
    for (const f of this.fish) {
      if (!f.alive) continue;
      const dx = f.x - hx;
      const dy = f.y - hy;
      const d = Math.hypot(dx, dy);
      if (d > range || d < 1e-3) continue;
      const cos = (dx * fx + dy * fy) / d;
      if (cos < 0.2) continue;
      const crowd = this.bucketCount[this.bucketOf(f.x, f.y)];
      const score = d * (1 + (1 - cos) * 0.8) * (1 + crowd * 0.07);
      if (score < bestScore) {
        bestScore = score;
        best = f;
      }
      if (f === sh.target) currentScore = score;
    }
    if (sh.target && currentScore < bestScore * 1.3) return sh.target;
    return best;
  }
  respawn() {
    const { time, width: W, height: H } = this;
    const due = [];
    for (const f of this.fish) if (!f.alive && f.respawnAt <= time) due.push(f);
    if (due.length === 0) return;
    if (due.length < 6 && time - this.lastSpawn < 9) return;
    this.lastSpawn = time;
    const side = randInt(0, 3);
    const along = rand(0.15, 0.85);
    const x = side === 0 ? -20 : side === 1 ? W + 20 : along * W;
    const y = side === 2 ? -20 : side === 3 ? H + 20 : along * H;
    const inward = Math.atan2(H / 2 - y, W / 2 - x) + rand(-0.5, 0.5);
    const species = pickSpecies();
    const sp = SPECIES[species];
    const millDir = Math.random() < 0.5 ? 1 : -1;
    for (const f of due.slice(0, sp.schoolSize[1])) {
      f.alive = true;
      f.species = species;
      f.alarm = 0;
      f.turn = 0;
      f.millDir = millDir;
      f.x = x + rand(-1, 1) * this.perception;
      f.y = y + rand(-1, 1) * this.perception;
      f.vx = Math.cos(inward) * sp.cruise * 1.4;
      f.vy = Math.sin(inward) * sp.cruise * 1.4;
    }
  }
}
const ALPHA_LEVELS = 6;
const FISH_ALPHAS = [0.28, 0.42, 0.58, 0.74, 0.9];
const DOT_RGB = [
  [48, 52, 235],
  [52, 205, 60],
  [228, 50, 44],
  [190, 212, 255],
  [110, 230, 255]
];
const DOT_BASE_ALPHA = [1, 1, 1, 1, 1];
const WAKE = DOT_RGB.length - 1;
const LIGHT_WAKE_RGB = [20, 110, 190];
const SHARK_COLORS = [
  [0.25, 1.05, 1.2],
  [0.95, 0.4, 1.2],
  [1.2, 0.72, 0.2],
  [0.3, 1.15, 0.5]
];
const REFERENCE_GLYPH_SCALE = 0.6;
function cellWidthFor(width, glyphScale) {
  return clamp(Math.round(width / 124 * glyphScale), 2, 13);
}
function cellHeightFor(cellWidth) {
  return Math.round(cellWidth * 1.45);
}
const GLINT_RATE = [0.03, 0.09];
const SPARK_RATE = [0, 0.04];
const EDGE_GLINT_RATE = [0.02, 0.07];
const GLINT_HZ = [0.4, 2.4];
const ACCENTS = [
  [224, 137, 44],
  [224, 58, 50],
  [180, 74, 224],
  [51, 200, 204],
  [60, 181, 74],
  [49, 80, 232],
  [217, 193, 74]
];
const SKIN_RAMP = ":;t%SX8#@";
const FIN_GLYPHS = "%;tS:";
const RIDGE_GLYPHS = "@8%";
const EDGE_HEAVY = ":;";
const EDGE_LIGHT = ".',`";
const FLAG_BODY = 1;
const FLAG_EDGE = 2;
const FLAG_FIN = 3;
const FLAG_RIDGE = 4;
const FLAG_EYE = 5;
const FLAG_MARK = 6;
const MARK_GLYPHS = "#%@";
const SUBSAMPLES = [0.25, 0.3, 0.75, 0.3, 0.25, 0.72, 0.75, 0.72];
const MIN_GLYPH_PX = 5;
const EXTENT_BINS = 64;
const extentCache = /* @__PURE__ */ new Map();
function shapeExtent(shape) {
  let table = extentCache.get(shape);
  if (table) return table;
  table = new Float32Array(EXTENT_BINS);
  const finTip = shape.pectoral[3] * 1.06 * 1.35;
  const [p0, p1, p2] = shape.pectoral;
  const [v0, v1, v2, vr] = shape.pelvic;
  const head = shape.head;
  for (let b = 0; b < EXTENT_BINS; b++) {
    const lo = b / EXTENT_BINS;
    const hi = (b + 1) / EXTENT_BINS;
    let e = 0;
    for (let k = 0; k <= 8; k++) e = Math.max(e, shape.halfWidth(lo + (hi - lo) * k / 8));
    if (hi >= Math.min(p0, p1, p2) && lo <= Math.max(p0, p1, p2)) e = Math.max(e, finTip);
    if (hi >= Math.min(v0, v1, v2) && lo <= Math.max(v0, v1, v2)) e = Math.max(e, vr);
    if (shape.caudal > 0 && hi >= 0.86) e = Math.max(e, shape.caudal);
    if (head && lo <= head.sweep + head.depth + head.notch) e = Math.max(e, head.span);
    table[b] = e;
  }
  extentCache.set(shape, table);
  return table;
}
function reachNear(extent, s, pad) {
  const b = Math.min(EXTENT_BINS - 1, Math.floor(s * EXTENT_BINS));
  let e = 0;
  for (let k = Math.max(0, b - pad); k <= Math.min(EXTENT_BINS - 1, b + pad); k++) e = Math.max(e, extent[k]);
  return e;
}
function byte(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}
function lerp(a, b, k) {
  return a + (b - a) * k;
}
function paleMix(tint, f) {
  return lerp(Math.min(255, 140 * tint), 255, f);
}
const rgbCache = /* @__PURE__ */ new Map();
function rgb(r, g, b) {
  const key2 = r << 16 | g << 8 | b;
  let style = rgbCache.get(key2);
  if (!style) {
    style = `rgb(${r},${g},${b})`;
    rgbCache.set(key2, style);
  }
  return style;
}
const TILE = 8;
function classicHalfWidth(s) {
  if (s < 0.13) return 0.09 * Math.pow(Math.sin(s / 0.13 * Math.PI / 2), 0.95);
  if (s < 0.3) return 0.09 + 0.016 * smoothstep(0.13, 0.3, s);
  if (s < 0.84) return 0.019 + 0.087 * Math.pow(1 - (s - 0.3) / 0.54, 1.25);
  const k = (s - 0.84) / 0.16;
  return 0.019 * (1 - k) + 0.012 * Math.sin(k * Math.PI);
}
const SHAPES = {
  classic: {
    halfWidth: classicHalfWidth,
    pectoral: [0.15, 0.43, 0.55, 0.26],
    falcate: true,
    pelvic: [0.57, 0.65, 0.69, 0.085],
    caudal: 0.085,
    dorsal: [0.33, 0.47],
    secondDorsal: [0.71, 0.76],
    eye: [0.1, 0.14],
    gills: [0.19, 0.29],
    tint: [0.92, 0.97, 1.05]
  },
  // Slim neck under a wide, swept-back cephalofoil (drawn in sampleShark),
  // tall first dorsal, long upper tail lobe. Bronze-olive grey.
  hammerhead: {
    halfWidth: (s) => {
      if (s < 0.06) return 0.045;
      if (s < 0.3) return 0.045 + 0.061 * smoothstep(0.06, 0.3, s);
      return classicHalfWidth(s) * 0.92;
    },
    head: { span: 0.17, sweep: 0.035, depth: 0.09, notch: 0 },
    pectoral: [0.17, 0.4, 0.5, 0.22],
    falcate: true,
    pelvic: [0.56, 0.63, 0.67, 0.075],
    caudal: 0.11,
    dorsal: [0.28, 0.44],
    secondDorsal: [0.7, 0.74],
    eye: null,
    gills: [0.16, 0.26],
    tint: [0.96, 0.98, 0.9]
  },
  // Blunt, square snout on a heavy body; barred back. Warm grey-brown.
  tiger: {
    halfWidth: (s) => {
      if (s < 0.13) return 0.1 * Math.pow(Math.sin(s / 0.13 * Math.PI / 2), 0.45);
      if (s < 0.3) return 0.1 + 0.014 * smoothstep(0.13, 0.3, s);
      if (s < 0.84) return 0.019 + 0.095 * Math.pow(1 - (s - 0.3) / 0.54, 1.2);
      const k = (s - 0.84) / 0.16;
      return 0.019 * (1 - k) + 0.012 * Math.sin(k * Math.PI);
    },
    pectoral: [0.15, 0.42, 0.53, 0.25],
    falcate: true,
    pelvic: [0.57, 0.65, 0.69, 0.085],
    caudal: 0.095,
    dorsal: [0.33, 0.46],
    secondDorsal: [0.71, 0.75],
    eye: [0.08, 0.12],
    gills: [0.19, 0.28],
    tint: [1.02, 0.95, 0.84]
  },
  // Short rounded head, body done by half-length, then a long ribbon of a
  // tail fin. Broad rounded pectorals, spotted sandy skin.
  zebra: {
    halfWidth: (s) => {
      if (s < 0.1) return 0.075 * Math.pow(Math.sin(s / 0.1 * Math.PI / 2), 0.7);
      if (s < 0.28) return 0.075 + 0.025 * smoothstep(0.1, 0.28, s);
      if (s < 0.55) return 0.022 + 0.078 * Math.pow(1 - (s - 0.28) / 0.27, 1.1);
      const k = (s - 0.55) / 0.45;
      return 0.022 * (1 - k * k) + 0.012 * Math.sin(k * Math.PI);
    },
    pectoral: [0.12, 0.3, 0.36, 0.19],
    falcate: false,
    pelvic: [0.42, 0.48, 0.51, 0.065],
    caudal: 0,
    dorsal: [0.36, 0.44],
    secondDorsal: [0.49, 0.53],
    eye: [0.06, 0.09],
    gills: [0.13, 0.2],
    tint: [1.08, 0.97, 0.74]
  },
  // Great hammerhead: a broader, nearly straight-edged cephalofoil with a notch at the centre,
  // a towering sickle first dorsal (drawn long and bright from above), and a cooler slate skin.
  greathammer: {
    halfWidth: (s) => {
      if (s < 0.05) return 0.04;
      if (s < 0.3) return 0.04 + 0.07 * smoothstep(0.05, 0.3, s);
      return classicHalfWidth(s) * 0.95;
    },
    head: { span: 0.21, sweep: 6e-3, depth: 0.085, notch: 0.014 },
    pectoral: [0.16, 0.38, 0.49, 0.24],
    falcate: true,
    pelvic: [0.55, 0.62, 0.67, 0.085],
    caudal: 0.13,
    dorsal: [0.24, 0.45],
    secondDorsal: [0.68, 0.74],
    eye: null,
    gills: [0.15, 0.25],
    tint: [0.86, 0.93, 1.02]
  },
  // Shortfin mako: a long conical snout, a torpedo body that narrows hard to the tail stalk,
  // and a tall crescent tail. Metallic indigo back.
  mako: {
    halfWidth: (s) => {
      if (s < 0.17) return 0.088 * Math.pow(Math.sin(s / 0.17 * Math.PI / 2), 1.5);
      if (s < 0.32) return 0.088 + 0.012 * smoothstep(0.17, 0.32, s);
      if (s < 0.86) return 0.014 + 0.086 * Math.pow(1 - (s - 0.32) / 0.54, 1.45);
      const k = (s - 0.86) / 0.14;
      return 0.014 * (1 - k) + 0.01 * Math.sin(k * Math.PI);
    },
    pectoral: [0.18, 0.4, 0.5, 0.21],
    falcate: true,
    pelvic: [0.58, 0.64, 0.68, 0.06],
    caudal: 0.13,
    dorsal: [0.34, 0.45],
    secondDorsal: [0.76, 0.79],
    eye: [0.11, 0.15],
    gills: [0.2, 0.3],
    tint: [0.78, 0.9, 1.2]
  },
  // Thresher: a compact body over the front half, then the upper tail lobe as a long whip
  // that's as long as the shark itself. Big eyes, long sickle pectorals, bronze-violet skin.
  thresher: {
    halfWidth: (s) => {
      if (s < 0.08) return 0.07 * Math.pow(Math.sin(s / 0.08 * Math.PI / 2), 0.75);
      if (s < 0.2) return 0.07 + 0.02 * smoothstep(0.08, 0.2, s);
      if (s < 0.48) return 0.012 + 0.078 * Math.pow(1 - (s - 0.2) / 0.28, 1.3);
      const k = (s - 0.48) / 0.52;
      return 0.012 * (1 - k) + 6e-3 * Math.sin(k * Math.PI * 0.9) + 2e-3;
    },
    pectoral: [0.12, 0.27, 0.36, 0.2],
    falcate: true,
    pelvic: [0.37, 0.41, 0.44, 0.045],
    caudal: 0,
    dorsal: [0.24, 0.32],
    secondDorsal: [0.45, 0.47],
    eye: [0.05, 0.1],
    gills: [0.11, 0.18],
    tint: [1, 0.9, 1.08]
  },
  // Nurse shark: a blunt, broad head, a heavy flattened body with both dorsals set far back,
  // rounded paddle pectorals, and a long low tail with no lower lobe. Tawny brown.
  nurse: {
    halfWidth: (s) => {
      if (s < 0.08) return 0.085 * Math.pow(Math.sin(s / 0.08 * Math.PI / 2), 0.4);
      if (s < 0.3) return 0.085 + 0.02 * smoothstep(0.08, 0.3, s);
      if (s < 0.72) return 0.022 + 0.083 * Math.pow(1 - (s - 0.3) / 0.42, 1.1);
      const k = (s - 0.72) / 0.28;
      return 0.022 * (1 - k * k) + 0.014 * Math.sin(k * Math.PI);
    },
    pectoral: [0.16, 0.34, 0.4, 0.17],
    falcate: false,
    pelvic: [0.45, 0.52, 0.55, 0.075],
    caudal: 0,
    dorsal: [0.5, 0.58],
    secondDorsal: [0.63, 0.69],
    eye: [0.05, 0.075],
    gills: [0.14, 0.22],
    tint: [1.1, 0.96, 0.76]
  }
};
const KINDS = Object.keys(SHAPES);
function inTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}
function paintGrid(g, W, H, cw, ch, dpr, color = "rgba(255,255,255,0.055)") {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.strokeStyle = color;
  g.lineWidth = 1;
  g.beginPath();
  for (let c = 0; c <= Math.ceil(W / cw); c++) {
    const x = Math.round(c * cw * dpr) + 0.5;
    g.moveTo(x, 0);
    g.lineTo(x, H * dpr);
  }
  for (let r = 0; r <= Math.ceil(H / ch); r++) {
    const y = Math.round(r * ch * dpr) + 0.5;
    g.moveTo(0, y);
    g.lineTo(W * dpr, y);
  }
  g.stroke();
}
class AsciiRenderer {
  constructor(canvas2) {
    __publicField(this, "ctx");
    __publicField(this, "bg");
    __publicField(this, "dpr", 1);
    __publicField(this, "width", 0);
    __publicField(this, "height", 0);
    __publicField(this, "cw", 12);
    __publicField(this, "ch", 18);
    __publicField(this, "cols", 0);
    __publicField(this, "rows", 0);
    __publicField(this, "fontFamily", "ui-monospace, Menlo, monospace");
    __publicField(this, "dotKind", new Uint8Array(0));
    // 0 none, 1 blue, 2 green, 3 red, 4 pale
    __publicField(this, "dotPhase", new Float32Array(0));
    __publicField(this, "dotFreq", new Float32Array(0));
    __publicField(this, "energy", new Float32Array(0));
    __publicField(this, "energyTmp", new Float32Array(0));
    __publicField(this, "heat", new Float32Array(0));
    __publicField(this, "bucketOf", new Uint8Array(0));
    __publicField(this, "bucketOrder", new Int32Array(0));
    __publicField(this, "bucketCounts", new Int32Array(DOT_RGB.length * ALPHA_LEVELS + 1));
    __publicField(this, "dotStyles", []);
    __publicField(this, "sharkFlag", new Uint8Array(0));
    __publicField(this, "sharkShade", new Float32Array(0));
    __publicField(this, "sharkKey", new Uint32Array(0));
    /** Coarser body-anchored key that picks which skin patches glint. */
    __publicField(this, "sharkPatch", new Uint32Array(0));
    __publicField(this, "sharkDepth", new Float32Array(0));
    __publicField(this, "sharkKind", new Uint8Array(0));
    __publicField(this, "sharkColor", new Uint8Array(0));
    __publicField(this, "palette", []);
    /** Scales the character cell; shapes are laid out in px, so sharks keep their size. */
    __publicField(this, "glyphScale", 1);
    /** Cells darkened by a shark's shadow on the seabed. */
    __publicField(this, "sharkShadow", new Uint8Array(0));
    __publicField(this, "spine", new Float32Array(SHARK_NODES * 2));
    __publicField(this, "arc", new Float32Array(SHARK_NODES));
    __publicField(this, "arcTotal", 1);
    __publicField(this, "shape", SHAPES.classic);
    __publicField(this, "sharkId", 0);
    __publicField(this, "finTipLeft", 0);
    __publicField(this, "finTipRight", 0);
    // Scratch outputs of sampleShark(), to avoid allocating per sample.
    __publicField(this, "hitFlag", 0);
    __publicField(this, "hitShade", 0);
    __publicField(this, "hitS", 0);
    __publicField(this, "hitV", 0);
    __publicField(this, "hitDist", 0);
    /** Body half-width at the hit, or 0 when the point is off the body. */
    __publicField(this, "hitW", 0);
    /** Per-segment midpoints and half-lengths of the render spine, for pruning. */
    __publicField(this, "segMid", new Float32Array((SHARK_NODES - 1) * 2));
    __publicField(this, "segHalf", new Float32Array(SHARK_NODES - 1));
    /** Segment nearest the previous sample; tried first since neighbours share it. */
    __publicField(this, "segHint", 0);
    /** Cells holding a fish this frame (frame stamp); dots skip them. */
    __publicField(this, "fishStamp", new Uint32Array(0));
    __publicField(this, "frameId", 0);
    /** Fish cells bucketed by brightness, so each bucket is one fillStyle. */
    __publicField(this, "fishBuckets", FISH_ALPHAS.map(() => []));
    __publicField(this, "fishStyles", []);
    /** A dash glyph only a few px tall renders faint, so tiny bars are dimmed to match. */
    __publicField(this, "tinyFishStyles", []);
    /** Light theme: white water with the same scene drawn in light-on-dark's place. */
    __publicField(this, "light", false);
    /** 0: calm glints in the shark's own colour … 1: the original busy multicolour sparkle. */
    __publicField(this, "shimmer", 0);
    __publicField(this, "ripples", []);
    this.canvas = canvas2;
    const ctx = canvas2.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
    this.bg = document.createElement("canvas");
    this.buildStyles();
  }
  setLight(light) {
    if (light === this.light) return;
    this.light = light;
    this.buildStyles();
    if (this.width) this.paintBackground();
  }
  buildStyles() {
    this.dotStyles = [];
    for (let c = 0; c < DOT_RGB.length; c++) {
      const [r, g, b] = this.light && c === WAKE ? LIGHT_WAKE_RGB : DOT_RGB[c];
      for (let l = 0; l < ALPHA_LEVELS; l++) {
        const a = DOT_BASE_ALPHA[c] * (l + 1) / ALPHA_LEVELS;
        this.dotStyles.push(`rgba(${r},${g},${b},${a.toFixed(3)})`);
      }
    }
    const fish = this.light ? "20,28,40" : "230,238,255";
    this.fishStyles = FISH_ALPHAS.map((a) => `rgba(${fish},${a})`);
    this.tinyFishStyles = FISH_ALPHAS.map((a) => `rgba(${fish},${(a * 0.33).toFixed(3)})`);
  }
  get cellWidth() {
    return this.cw;
  }
  get cellHeight() {
    return this.ch;
  }
  setFontFamily(family) {
    if (family) this.fontFamily = family;
  }
  /** Per-shark colours as #rrggbb, indexed like the shark specs; null keeps the built-in tint. */
  setSharkColors(colors) {
    this.palette = colors.map((hex) => {
      const m = hex ? /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex) : null;
      return m ? [1, 2, 3].map((k) => parseInt(m[k], 16) / 255 * 1.3) : null;
    });
  }
  resize(width, height, dpr) {
    const prevCols = this.cols;
    const prevRows = this.rows;
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.cw = clamp(Math.round(width / 124 * this.glyphScale), 2, 13);
    this.ch = cellHeightFor(this.cw);
    this.cols = Math.ceil(width / this.cw);
    this.rows = Math.ceil(height / this.ch);
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.bg.width = this.canvas.width;
    this.bg.height = this.canvas.height;
    const n = this.cols * this.rows;
    if (this.cols !== prevCols || this.rows !== prevRows) {
      this.dotKind = new Uint8Array(n);
      this.dotPhase = new Float32Array(n);
      this.dotFreq = new Float32Array(n);
      this.energy = new Float32Array(n);
      this.energyTmp = new Float32Array(n);
      this.heat = new Float32Array(n);
      this.bucketOf = new Uint8Array(n);
      this.bucketOrder = new Int32Array(n);
      this.sharkFlag = new Uint8Array(n);
      this.sharkShade = new Float32Array(n);
      this.sharkKey = new Uint32Array(n);
      this.sharkPatch = new Uint32Array(n);
      this.sharkDepth = new Float32Array(n);
      this.sharkKind = new Uint8Array(n);
      this.sharkColor = new Uint8Array(n);
      this.sharkShadow = new Uint8Array(n);
      this.fishStamp = new Uint32Array(n);
    }
    for (let i = 0; i < n; i++) {
      const col = i % this.cols;
      const row = i / this.cols | 0;
      this.dotKind[i] = 0;
      this.dotPhase[i] = hash3(col, row, 23) * Math.PI * 2;
      this.dotFreq[i] = 0.3 + hash3(col, row, 37) * 1.1;
    }
    this.paintBackground();
  }
  paintBackground() {
    const g = this.bg.getContext("2d");
    if (!g) return;
    const { width: W, height: H, dpr, cw, ch } = this;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = this.light ? "#fff" : "#000";
    g.fillRect(0, 0, W, H);
    paintGrid(g, W, H, cw, ch, dpr, this.light ? "rgba(0,0,0,0.06)" : void 0);
  }
  render(world, dt) {
    const { ctx, dpr, cols, ch } = this;
    if (cols === 0) return;
    const t2 = world.time;
    this.consumeEvents(world);
    this.depositRipples(t2);
    this.rasterizeSharks(world.sharks, t2);
    this.depositWake(world);
    this.diffuse(dt);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.bg, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.markFish(world);
    this.drawDots(t2);
    ctx.font = `600 ${Math.round(ch * 0.74)}px ${this.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    this.drawHeat();
    this.drawFish();
    this.drawSharks(t2);
  }
  // ── simulation → field ──────────────────────────────────────────────
  cellIndex(x, y) {
    const c = Math.floor(x / this.cw);
    const r = Math.floor(y / this.ch);
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return -1;
    return r * this.cols + c;
  }
  stamp(field, x, y, radius, amount) {
    const c0 = Math.floor(x / this.cw);
    const r0 = Math.floor(y / this.ch);
    for (let r = r0 - radius; r <= r0 + radius; r++) {
      for (let c = c0 - radius; c <= c0 + radius; c++) {
        if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) continue;
        const d = Math.hypot(c - c0, (r - r0) * 1.4);
        if (d > radius + 0.5) continue;
        const i = r * this.cols + c;
        field[i] = Math.min(1.6, field[i] + amount * (1 - d / (radius + 1)));
      }
    }
  }
  consumeEvents(world) {
    for (const e of world.events) {
      if (e.kind === "eat") {
        this.stamp(this.heat, e.x, e.y, this.cellsFor(18), 1);
        this.stamp(this.energy, e.x, e.y, this.cellsFor(27), 0.9);
      } else {
        this.stamp(this.energy, e.x, e.y, this.cellsFor(8), 1.2);
        this.ripples.push({ x: e.x, y: e.y, born: world.time });
      }
    }
    world.events.length = 0;
  }
  /** A px radius in whole cells, so effects keep their size as glyphs shrink. */
  cellsFor(px) {
    return Math.max(1, Math.round(px / this.cw));
  }
  /**
   * Each ripple is a few concentric rings spreading outward and fading.
   * They light the wake field along a thin band, so the diffusion softens
   * their trailing edge.
   */
  depositRipples(t2) {
    const { cols, rows, cw, ch, energy } = this;
    const band = Math.max(cw * 0.8, 3);
    const gap = Math.max(10, cw * 1.8);
    this.ripples = this.ripples.filter((rp) => t2 - rp.born < RIPPLE_LIFE);
    for (const rp of this.ripples) {
      const age = t2 - rp.born;
      const fade = 1 - age / RIPPLE_LIFE;
      const outer = age * RIPPLE_SPEED;
      const reach = outer + band;
      const c0 = clamp(Math.floor((rp.x - reach) / cw), 0, cols - 1);
      const c1 = clamp(Math.floor((rp.x + reach) / cw), 0, cols - 1);
      const r0 = clamp(Math.floor((rp.y - reach) / ch), 0, rows - 1);
      const r1 = clamp(Math.floor((rp.y + reach) / ch), 0, rows - 1);
      for (let r = r0; r <= r1; r++) {
        const dy = (r + 0.5) * ch - rp.y;
        for (let c = c0; c <= c1; c++) {
          const d = Math.hypot((c + 0.5) * cw - rp.x, dy);
          let v = 0;
          for (let k = 0; k < RIPPLE_RINGS; k++) {
            const radius = outer - k * gap;
            if (radius <= 0) break;
            const off = Math.abs(d - radius);
            if (off < band) v = Math.max(v, (1 - off / band) * (1 - k * 0.3));
          }
          if (v > 0) {
            const i = r * cols + c;
            energy[i] = Math.max(energy[i], 0.45 + v * fade * 0.9);
          }
        }
      }
    }
  }
  depositWake(world) {
    const { energy } = this;
    for (const f of world.fish) {
      if (!f.alive) continue;
      const i = this.cellIndex(f.x, f.y);
      if (i >= 0) energy[i] = Math.min(1.6, energy[i] + 0.012 + f.alarm * 0.03);
    }
    for (const sh of world.sharks) {
      for (let k = SHARK_NODES - 6; k < SHARK_NODES; k++) {
        const i = this.cellIndex(sh.nodes[k * 2], sh.nodes[k * 2 + 1]);
        if (i >= 0) energy[i] = Math.min(1.6, energy[i] + 0.05 + sh.speed * 12e-4);
      }
    }
    if (world.pointer.active) {
      this.stamp(energy, world.pointer.x, world.pointer.y, 1, 0.08);
    }
  }
  /** Blur + decay so wakes spread out like ripples and fade. */
  diffuse(dt) {
    const { cols, rows, energy, energyTmp: tmp, heat } = this;
    const decay = Math.exp(-dt * 1.5);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const l = c > 0 ? energy[i - 1] : energy[i];
        const rt = c < cols - 1 ? energy[i + 1] : energy[i];
        const u = r > 0 ? energy[i - cols] : energy[i];
        const d = r < rows - 1 ? energy[i + cols] : energy[i];
        tmp[i] = (energy[i] * 4 + l + rt + u + d) * 0.125 * decay;
      }
    }
    this.energy = tmp;
    this.energyTmp = energy;
    const heatDecay = Math.exp(-dt * 2.2);
    for (let i = 0; i < heat.length; i++) heat[i] *= heatDecay;
  }
  // ── sharks ──────────────────────────────────────────────────────────
  /**
   * Classify one point against the current shark (spine/arc already built).
   * Body coordinates: s along the spine (0 snout → 1 tail), v across it.
   * Writes hit* fields and returns whether the point is on the shark.
   */
  sampleShark(px, py, L) {
    const { spine, arc, segMid, segHalf } = this;
    const N = SHARK_NODES;
    let best = Infinity;
    let bestA = Infinity;
    let bestK = N;
    let bestS = 0;
    let bestSign = 1;
    let bestNx = 0;
    let bestNy = 0;
    for (let j = 0; j < N - 1; j++) {
      const k = (j + this.segHint) % (N - 1);
      const mx = px - segMid[k * 2];
      const my = py - segMid[k * 2 + 1];
      const reach = bestA + segHalf[k];
      if (mx * mx + my * my > reach * reach) continue;
      const ax = spine[k * 2];
      const ay = spine[k * 2 + 1];
      const sx = spine[(k + 1) * 2] - ax;
      const sy = spine[(k + 1) * 2 + 1] - ay;
      const len2 = sx * sx + sy * sy || 1;
      const u2 = clamp(((px - ax) * sx + (py - ay) * sy) / len2, 0, 1);
      const qx = ax + sx * u2;
      const qy = ay + sy * u2;
      const d2 = (px - qx) ** 2 + (py - qy) ** 2;
      if (d2 < best || d2 === best && k < bestK) {
        best = d2;
        bestA = Math.sqrt(d2);
        bestK = k;
        const len = Math.sqrt(len2);
        bestS = (arc[k] + u2 * len) / this.arcTotal;
        bestSign = sx * (py - ay) - sy * (px - ax) >= 0 ? 1 : -1;
        bestNx = -sy / len * bestSign;
        bestNy = sx / len * bestSign;
      }
    }
    this.segHint = bestK;
    const a = bestA;
    const s = bestS;
    const u = s * L;
    const shape = this.shape;
    const w = shape.halfWidth(s) * L;
    this.hitDist = a;
    this.hitS = s;
    this.hitV = a * bestSign;
    this.hitW = 0;
    const head = this.shape.head;
    if (head && u < L * (head.sweep + head.depth + head.notch)) {
      const span = L * head.span;
      const r = a / span;
      const front = L * head.sweep * r * r + L * head.notch * Math.max(0, 1 - r / 0.14);
      const depth = L * head.depth * (1 - 0.2 * r * r * r * r);
      if (r <= 1 && u >= front && u <= front + depth) {
        this.hitFlag = r > 0.84 ? FLAG_EYE : FLAG_BODY;
        this.hitShade = r > 0.84 ? 0 : 0.62 - 0.2 * r + (u < front + L * 0.012 ? 0.1 : 0);
        return true;
      }
    }
    if (a <= w) {
      this.hitW = w;
      const across = a / (w || 1);
      const facing = (bestNx * -0.6 + bestNy * -0.8) * across;
      let shade = 0.58 - across * across * 0.42 + facing * 0.26;
      let flag = FLAG_BODY;
      if (s > shape.dorsal[0] && s < shape.dorsal[1] && across < 0.3) {
        flag = FLAG_RIDGE;
        shade = 1;
      } else if (s > shape.secondDorsal[0] && s < shape.secondDorsal[1] && across < 0.4) {
        shade = Math.max(shade, 0.82);
      } else if (shape.eye && s > shape.eye[0] && s < shape.eye[1] && across > 0.6) {
        flag = FLAG_EYE;
        shade = 0;
      } else if (s > shape.gills[0] && s < shape.gills[1] && across > 0.58) {
        if (Math.floor((s - shape.gills[0]) / (shape.gills[1] - shape.gills[0]) * 5) % 2 === 0) shade *= 0.45;
      } else if (s < 0.05) {
        shade = Math.max(shade, 0.7);
      } else if (shape === SHAPES.zebra && s > 0.08 && s < 0.55 && (across < 0.1 || Math.abs(across - 0.6) < 0.08)) {
        shade = Math.max(shade, 0.8);
      } else if (this.marked(s, a * bestSign, L, across)) {
        flag = FLAG_MARK;
      }
      this.hitFlag = flag;
      this.hitShade = shade;
      return true;
    }
    const tip = bestSign > 0 ? this.finTipRight : this.finTipLeft;
    const [p0, p1, p2] = shape.pectoral;
    if (inTriangle(u, a, L * p0, 0, L * p1, 0, L * p2, tip) && // Falcate (sickle) fins get a concave trailing edge.
    !(shape.falcate && inTriangle(u, a, L * p1, 0, L * (p1 + (p2 - p1) * 0.33), tip * 0.55, L * p2, tip))) {
      this.hitFlag = this.marked(s, a * bestSign, L, 0) ? FLAG_MARK : FLAG_FIN;
      this.hitShade = 0.38 + 0.22 * (1 - clamp(a / tip, 0, 1));
      return true;
    }
    const [v0, v1, v2, vr] = shape.pelvic;
    if (inTriangle(u, a, L * v0, 0, L * v1, 0, L * v2, L * vr) || // Forked caudal fin.
    shape.caudal > 0 && inTriangle(u, a, L * 0.86, 0, L * 0.95, 0, L, L * shape.caudal)) {
      this.hitFlag = FLAG_FIN;
      this.hitShade = 0.36;
      return true;
    }
    return false;
  }
  /** Whether a body point (s along, v across) falls on a dark marking. */
  marked(s, v, L, across) {
    if (this.shape === SHAPES.tiger) {
      if (s < 0.2 || s > 0.9 || across > 0.85) return false;
      const wobble = 0.35 * Math.sin(v / L * 25 + s * 5);
      const bar = Math.sin(s * Math.PI * 2 * 9 + wobble);
      return bar > 0.65 - 0.5 * smoothstep(0.2, 0.42, s) + 0.4 * smoothstep(0.8, 0.9, s);
    }
    if (this.shape === SHAPES.zebra) {
      if (s < 0.07) return false;
      const gu = s * L / (L * 0.06);
      const gv = v / (L * 0.045);
      const cu = Math.floor(gu);
      const cv = Math.floor(gv);
      const jx = hash3(cu, cv, this.sharkId) * 0.5 + 0.25;
      const jy = hash3(cu, cv, this.sharkId + 11) * 0.5 + 0.25;
      return (gu - cu - jx) ** 2 + (gv - cv - jy) ** 2 < 0.08;
    }
    return false;
  }
  /**
   * Build a smooth, undulating render spine from the sim spine, then
   * supersample every cell in the shark's bounding box against the shape.
   * Fully covered cells become solid skin; partial cells become edge glyphs.
   */
  rasterizeSharks(sharks, t2) {
    const { sharkFlag, sharkShade, sharkKey, sharkDepth, sharkKind, sharkShadow, spine, arc, cw, ch, cols, rows } = this;
    sharkFlag.fill(0);
    sharkShadow.fill(0);
    for (const sh of sharks) {
      const L = sh.length;
      const N = SHARK_NODES;
      const n = sh.nodes;
      const swim = clamp(sh.speed / 60, 0.4, 1.4);
      this.shape = SHAPES[sh.kind];
      this.sharkId = sh.id;
      const kindIndex = KINDS.indexOf(sh.kind);
      for (let k = 0; k < N; k++) {
        const s = k / (N - 1);
        const a = Math.max(0, k - 1);
        const b = Math.min(N - 1, k + 1);
        let tx = n[a * 2] - n[b * 2];
        let ty = n[a * 2 + 1] - n[b * 2 + 1];
        const tl = Math.hypot(tx, ty) || 1;
        tx /= tl;
        ty /= tl;
        const amp = L * 0.05 * (0.1 + 0.9 * Math.pow(s, 1.8)) * swim;
        const off = amp * Math.sin(sh.phase - s * 5.2);
        spine[k * 2] = n[k * 2] - ty * off;
        spine[k * 2 + 1] = n[k * 2 + 1] + tx * off;
      }
      arc[0] = 0;
      for (let k = 1; k < N; k++) {
        arc[k] = arc[k - 1] + Math.hypot(spine[k * 2] - spine[(k - 1) * 2], spine[k * 2 + 1] - spine[(k - 1) * 2 + 1]);
      }
      this.arcTotal = arc[N - 1] || 1;
      const { segMid, segHalf } = this;
      for (let k = 0; k < N - 1; k++) {
        segMid[k * 2] = (spine[k * 2] + spine[(k + 1) * 2]) / 2;
        segMid[k * 2 + 1] = (spine[k * 2 + 1] + spine[(k + 1) * 2 + 1]) / 2;
        segHalf[k] = (arc[k + 1] - arc[k]) / 2;
      }
      const bank = clamp(sh.turn * 0.45, -0.35, 0.35);
      const flex = 1 + 0.06 * Math.sin(sh.phase * 0.5);
      const reachFin = this.shape.pectoral[3];
      this.finTipRight = L * reachFin * flex * (1 - bank);
      this.finTipLeft = L * reachFin * flex * (1 + bank);
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (let k = 0; k < N; k++) {
        minX = Math.min(minX, spine[k * 2]);
        maxX = Math.max(maxX, spine[k * 2]);
        minY = Math.min(minY, spine[k * 2 + 1]);
        maxY = Math.max(maxY, spine[k * 2 + 1]);
      }
      const reach = L * 0.36;
      const c0 = Math.max(0, Math.floor((minX - reach) / cw));
      const c1 = Math.min(cols - 1, Math.floor((maxX + reach) / cw));
      const r0 = Math.max(0, Math.floor((minY - reach) / ch));
      const r1 = Math.min(rows - 1, Math.floor((maxY + reach) / ch));
      if (c0 > c1 || r0 > r1) continue;
      const skipBeyond = reach + Math.hypot(cw, ch);
      const shadowDc = Math.round(L * 0.035 / cw) + 1;
      const shadowDr = Math.round(L * 0.02 / ch) + 1;
      const diag = Math.hypot(cw, ch);
      const extent = shapeExtent(this.shape);
      const binPad = Math.ceil(diag / L * EXTENT_BINS) + 1;
      const tileR = Math.hypot(TILE * cw, TILE * ch) / 2;
      for (let tr = r0; tr <= r1; tr += TILE) {
        for (let tc = c0; tc <= c1; tc += TILE) {
          this.sampleShark((tc + TILE / 2) * cw, (tr + TILE / 2) * ch, L);
          if (this.hitDist - tileR > skipBeyond) continue;
          const rEnd = Math.min(r1, tr + TILE - 1);
          const cEnd = Math.min(c1, tc + TILE - 1);
          for (let r = tr; r <= rEnd; r++) {
            for (let c = tc; c <= cEnd; c++) {
              const x = c * cw;
              const y = r * ch;
              const centerHit = this.sampleShark(x + cw / 2, y + ch / 2, L);
              if (!centerHit && this.hitDist > skipBeyond) continue;
              const flag = this.hitFlag;
              const shade = this.hitShade;
              const s = this.hitS;
              const v = this.hitV;
              let hits = centerHit ? 1 : 0;
              if (centerHit && this.hitDist + diag <= this.hitW) {
                hits = 5;
              } else if (!centerHit && this.hitDist > reachNear(extent, s, binPad) * L + diag) {
                continue;
              } else {
                for (let k = 0; k < SUBSAMPLES.length; k += 2) {
                  if (this.sampleShark(x + SUBSAMPLES[k] * cw, y + SUBSAMPLES[k + 1] * ch, L)) hits++;
                }
              }
              if (hits === 0) continue;
              const coverage = hits / 5;
              const i = r * cols + c;
              const key2 = hash3(Math.round(s * 52), Math.round(v / (cw * 0.9)), sh.id) * 4294967295 >>> 0;
              sharkKey[i] = key2;
              this.sharkPatch[i] = hash3(Math.round(s * L / (2 * cw)), Math.round(v / (2 * cw)), sh.id + 97) * 4294967295 >>> 0;
              sharkDepth[i] = sh.depth;
              sharkKind[i] = kindIndex;
              this.sharkColor[i] = sh.id - 1 & 255;
              if (centerHit && coverage >= 0.6) {
                sharkFlag[i] = flag;
                const flicker = this.shimmer ? (hash3(c, r, Math.floor(t2 * 6)) - 0.5) * 0.06 * this.shimmer : 0;
                sharkShade[i] = clamp(shade + flicker, 0, 1);
                const sc = c + shadowDc;
                const sr = r + shadowDr;
                if (sc < cols && sr < rows) sharkShadow[sr * cols + sc] = 1;
              } else {
                sharkFlag[i] = FLAG_EDGE;
                sharkShade[i] = coverage;
              }
            }
          }
        }
      }
    }
  }
  drawSharks(t2) {
    const { ctx, cols, rows, cw, ch, sharkFlag, sharkShade, sharkKey, sharkPatch, sharkDepth, sharkKind, light } = this;
    const n = cols * rows;
    const sh = this.shimmer;
    const glintRate = lerp(GLINT_RATE[0], GLINT_RATE[1], sh);
    const sparkRate = lerp(SPARK_RATE[0], SPARK_RATE[1], sh);
    const edgeRate = lerp(EDGE_GLINT_RATE[0], EDGE_GLINT_RATE[1], sh);
    const hz = lerp(GLINT_HZ[0], GLINT_HZ[1], sh);
    const spark = light ? [27, 29, 36] : [255, 255, 255];
    const tiny = Math.round(ch * 0.74) < MIN_GLYPH_PX;
    for (let i = 0; i < n; i++) {
      const flag = sharkFlag[i];
      if (!flag) continue;
      const col = i % cols;
      const row = i / cols | 0;
      const x = col * cw;
      const y = row * ch;
      const key2 = sharkKey[i];
      const shade = sharkShade[i];
      const dim = 0.7 + 0.3 * sharkDepth[i];
      const [sr, sg, sb] = SHAPES[KINDS[sharkKind[i]]].tint;
      const [cr, cg, cb] = SHARK_COLORS[this.sharkColor[i] % SHARK_COLORS.length];
      const [tr, tg, tb] = this.palette[this.sharkColor[i]] ?? [sr * cr, sg * cg, sb * cb];
      const patch = sh >= 0.5 ? key2 : sharkPatch[i];
      const phase = t2 * hz + patch % 997 / 97;
      const tick = Math.floor(phase);
      const roll = hash3(patch, tick, 7);
      const glow = Math.round(lerp(Math.sin((phase - tick) * Math.PI), 1, sh) * 6) / 6;
      let gr0, gg0, gb0;
      if (hash3(patch, tick, 13) < sh) {
        const k = light ? 0.6 : 1;
        const a = ACCENTS[patch % ACCENTS.length];
        [gr0, gg0, gb0] = [a[0] * k, a[1] * k, a[2] * k];
      } else {
        const gl = light ? 95 : 235;
        [gr0, gg0, gb0] = [gl * tr, gl * tg, gl * tb];
      }
      if (flag === FLAG_EDGE) {
        const set = shade >= 0.5 ? EDGE_HEAVY : EDGE_LIGHT;
        let r, g, b;
        if (light) {
          const f = 1 - (1 - (0.72 - 0.32 * shade)) * dim;
          [r, g, b] = [paleMix(tr, f), paleMix(tg, f), paleMix(tb, f)];
        } else {
          const v = (70 + shade * 80) * dim;
          [r, g, b] = [v * tr, v * tg, v * tb + 6];
        }
        if (roll < edgeRate && glow > 0) [r, g, b] = [lerp(r, gr0, glow), lerp(g, gg0, glow), lerp(b, gb0, glow)];
        ctx.fillStyle = rgb(byte(r), byte(g), byte(b));
        ctx.fillText(set[(key2 >>> 8) % set.length], x + cw / 2, y + ch / 2 + 1);
        continue;
      }
      let level;
      let glyph;
      if (flag === FLAG_RIDGE) {
        level = 226;
        glyph = RIDGE_GLYPHS[(key2 >>> 8) % RIDGE_GLYPHS.length];
      } else if (flag === FLAG_EYE) {
        level = 12;
        glyph = "o";
      } else if (flag === FLAG_MARK) {
        level = 24 + shade * 22;
        glyph = MARK_GLYPHS[(key2 >>> 8) % MARK_GLYPHS.length];
      } else if (flag === FLAG_FIN) {
        level = 40 + shade * 120;
        glyph = FIN_GLYPHS[(key2 >>> 8) % FIN_GLYPHS.length];
      } else {
        level = 46 + shade * 160;
        const jitter = (patch >>> 4) % 3 - 1;
        glyph = SKIN_RAMP[clamp(Math.floor((1 - shade) * 8.99) + jitter, 0, SKIN_RAMP.length - 1)];
      }
      let br, bg, bb;
      if (light) {
        const f = 1 - (1 - 0.6 * Math.min(1, level / 226)) * dim;
        [br, bg, bb] = [paleMix(tr, f), paleMix(tg, f), paleMix(tb, f)];
      } else {
        const lv = level * (tiny ? dim * 0.92 : dim);
        [br, bg, bb] = [lv * tr, lv * tg, lv * tb + 4];
      }
      ctx.fillStyle = rgb(byte(br), byte(bg), byte(bb));
      ctx.fillRect(x + 1, y + 1, cw - 1, ch - 1);
      let gr, gg, gb;
      if (flag === FLAG_EYE) {
        [gr, gg, gb] = light ? [222, 226, 234] : [154, 160, 173];
      } else if (flag === FLAG_MARK) {
        [gr, gg, gb] = light ? [br * 0.7, bg * 0.7, bb * 0.7] : [70 * tr, 70 * tg, 70 * tb];
      } else if (roll < glintRate + sparkRate && glow > 0) {
        const [qr, qg, qb] = light ? [br * 0.82, bg * 0.82, bb * 0.82] : shade > 0.55 ? [14, 15, 19] : [27, 29, 36];
        const [pr, pg, pb] = roll < glintRate ? [gr0, gg0, gb0] : spark;
        [gr, gg, gb] = [lerp(qr, pr, glow), lerp(qg, pg, glow), lerp(qb, pb, glow)];
      } else if (tiny) {
        continue;
      } else if (light) {
        [gr, gg, gb] = [br * 0.82, bg * 0.82, bb * 0.82];
      } else {
        [gr, gg, gb] = shade > 0.55 ? [14, 15, 19] : [27, 29, 36];
      }
      ctx.fillStyle = rgb(byte(gr), byte(gg), byte(gb));
      ctx.fillText(glyph, x + cw / 2, y + ch / 2 + 1);
    }
  }
  // ── fish, dots, heat ────────────────────────────────────────────────
  /**
   * Snap each fish to a cell and bucket it by brightness: far fish are dim,
   * near fish brighter, and turning or panicking fish glint. Nearer fish
   * claim a cell first when two land in the same one.
   */
  markFish(world) {
    const { fishStamp, fishBuckets, sharkFlag } = this;
    const frame = ++this.frameId;
    for (const bucket of fishBuckets) bucket.length = 0;
    for (let pass = 0; pass < 2; pass++) {
      for (const f of world.fish) {
        if (!f.alive || (f.depth > 0.78 ? 0 : 1) !== pass) continue;
        const i = this.cellIndex(f.x, f.y);
        if (i < 0 || fishStamp[i] === frame || sharkFlag[i]) continue;
        fishStamp[i] = frame;
        const glint = clamp(Math.abs(f.turn) / 3.5, 0, 1);
        const v = 0.3 + 0.4 * (f.depth - 0.55) / 0.45 + 0.3 * Math.max(glint, f.alarm);
        fishBuckets[clamp(Math.floor(v * FISH_ALPHAS.length), 0, FISH_ALPHAS.length - 1)].push(i);
      }
    }
  }
  drawFish() {
    const { ctx, cw, ch, cols, fishBuckets } = this;
    const tiny = Math.round(ch * 0.74) < MIN_GLYPH_PX;
    const barW = Math.max(1, Math.round(cw * 0.8));
    const barX = Math.floor((cw - barW) / 2);
    const barY = Math.floor(ch / 2);
    for (let b = 0; b < fishBuckets.length; b++) {
      const bucket = fishBuckets[b];
      if (!bucket.length) continue;
      ctx.fillStyle = tiny ? this.tinyFishStyles[b] : this.fishStyles[b];
      for (const i of bucket) {
        if (tiny) ctx.fillRect(i % cols * cw + barX, (i / cols | 0) * ch + barY, barW, 1);
        else ctx.fillText("-", i % cols * cw + cw / 2, (i / cols | 0) * ch + ch / 2 + 1);
      }
    }
  }
  drawHeat() {
    const { ctx, heat, cols, cw, ch } = this;
    for (let i = 0; i < heat.length; i++) {
      const h = heat[i];
      if (h < 0.08) continue;
      const col = i % cols;
      const row = i / cols | 0;
      ctx.fillStyle = h > 0.5 ? `rgba(255,120,60,${h.toFixed(2)})` : `rgba(220,40,40,${(h * 1.6).toFixed(2)})`;
      ctx.fillText(h > 0.6 ? "*" : "·", col * cw + cw / 2, row * ch + ch / 2 + 1);
    }
  }
  /**
   * Every cell's dot twinkles on its own clock, is modulated by slow
   * caustic light bands, and flares cyan where the wake field is strong.
   * Dots are bucketed by colour/alpha so each bucket is one fillStyle.
   */
  drawDots(t2) {
    const { ctx, cols, rows, cw, ch, dotKind, dotPhase, dotFreq, energy, sharkFlag, sharkShadow, fishStamp, frameId } = this;
    const { bucketOf, bucketOrder, bucketCounts } = this;
    const n = cols * rows;
    const SKIP = bucketCounts.length - 1;
    bucketCounts.fill(0);
    for (let i = 0; i < n; i++) {
      const e = energy[i];
      const kind = dotKind[i];
      if (sharkFlag[i] || fishStamp[i] === frameId || kind === 0 && e < 0.45) {
        bucketOf[i] = SKIP;
        continue;
      }
      let bucket;
      if (e > 0.45) {
        const level = clamp(Math.floor((e - 0.45) * 5), 0, ALPHA_LEVELS - 1);
        bucket = WAKE * ALPHA_LEVELS + level;
      } else {
        const col = i % cols;
        const row = i / cols | 0;
        const twinkle = 0.5 + 0.5 * Math.sin(t2 * dotFreq[i] + dotPhase[i]);
        const caustic = 0.85 + 0.15 * Math.sin(col * 0.11 + t2 * 0.35) * Math.sin(row * 0.17 - t2 * 0.27);
        let v = clamp((0.55 + 0.45 * twinkle) * caustic + e * 2, 0, 1);
        if (sharkShadow[i]) v *= 0.2;
        bucket = (kind - 1) * ALPHA_LEVELS + clamp(Math.floor(v * ALPHA_LEVELS), 0, ALPHA_LEVELS - 1);
      }
      bucketOf[i] = bucket;
      bucketCounts[bucket]++;
    }
    const starts = new Int32Array(bucketCounts.length);
    for (let b = 1; b < bucketCounts.length; b++) starts[b] = starts[b - 1] + bucketCounts[b - 1];
    const cursor = starts.slice();
    for (let i = 0; i < n; i++) {
      const b = bucketOf[i];
      if (b !== SKIP) bucketOrder[cursor[b]++] = i;
    }
    const small = Math.max(2, Math.round(cw * 0.19));
    const large = small + 1;
    for (let b = 0; b < SKIP; b++) {
      const count = bucketCounts[b];
      if (!count) continue;
      ctx.fillStyle = this.dotStyles[b];
      const size = b >= WAKE * ALPHA_LEVELS ? large : small;
      const start = starts[b];
      for (let k = start; k < start + count; k++) {
        const i = bucketOrder[k];
        const col = i % cols;
        const row = i / cols | 0;
        ctx.fillRect(Math.round(col * cw + cw * 0.66 - size / 2), Math.round(row * ch + ch * 0.64 - size / 2), size, size);
      }
    }
  }
}
const STEP = 1 / 60;
const MAX_STEPS = 4;
class OceanEngine {
  constructor(canvas2, sharks, options = {}) {
    __publicField(this, "world");
    __publicField(this, "renderer");
    __publicField(this, "raf", 0);
    __publicField(this, "last", 0);
    __publicField(this, "acc", 0);
    __publicField(this, "visible", true);
    __publicField(this, "reducedMotion");
    __publicField(this, "resizeObserver");
    __publicField(this, "intersectionObserver");
    __publicField(this, "disposed", false);
    /** Simulation time multiplier; can be changed while running. */
    __publicField(this, "speed", 1);
    __publicField(this, "frame", (now) => {
      const dt = Math.min(0.1, (now - this.last) / 1e3) * this.speed;
      this.last = now;
      this.acc += dt;
      let steps = 0;
      while (this.acc >= STEP && steps < MAX_STEPS) {
        this.world.step(STEP);
        this.acc -= STEP;
        steps++;
      }
      if (steps === MAX_STEPS) this.acc = 0;
      this.renderer.render(this.world, dt);
      this.raf = requestAnimationFrame(this.frame);
    });
    __publicField(this, "onMotionPreference", () => {
      if (this.reducedMotion.matches) {
        cancelAnimationFrame(this.raf);
        this.drawStill();
      } else {
        this.schedule();
      }
    });
    __publicField(this, "onPointerMove", (e) => {
      const { x, y, inside } = this.toLocal(e);
      const p = this.world.pointer;
      p.x = x;
      p.y = y;
      p.active = inside && e.pointerType !== "touch";
    });
    __publicField(this, "onPointerDown", (e) => {
      const { x, y, inside } = this.toLocal(e);
      if (inside && !this.reducedMotion.matches) this.world.splash(x, y);
    });
    __publicField(this, "onPointerLeave", () => {
      this.world.pointer.active = false;
    });
    var _a2;
    this.canvas = canvas2;
    this.speed = options.speed ?? 1;
    this.world = new World(sharks, void 0, options.fishScale);
    this.renderer = new AsciiRenderer(canvas2);
    if (options.glyphScale) this.renderer.glyphScale = options.glyphScale;
    if (options.sharkColors) this.renderer.setSharkColors(options.sharkColors);
    if (options.light) this.renderer.setLight(true);
    this.renderer.shimmer = options.shimmer ?? 0;
    this.renderer.setFontFamily(getComputedStyle(canvas2).fontFamily);
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas2);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.schedule();
    });
    this.intersectionObserver.observe(canvas2);
    this.reducedMotion.addEventListener("change", this.onMotionPreference);
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerdown", this.onPointerDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", this.onPointerLeave);
    window.addEventListener("blur", this.onPointerLeave);
    this.resize();
    (_a2 = document.fonts) == null ? void 0 : _a2.load(`600 16px ${getComputedStyle(canvas2).fontFamily}`).then(() => {
      if (!this.disposed && this.reducedMotion.matches) this.drawStill();
    });
    this.schedule();
  }
  /** 0 calm … 1 the original busy sparkle; applies on the next frame. */
  setShimmer(shimmer) {
    this.renderer.shimmer = shimmer;
  }
  /** Switch between dark and light water without rebuilding the scene. */
  setLight(light) {
    this.renderer.setLight(light);
    if (this.reducedMotion.matches) this.drawStill();
  }
  destroy() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.reducedMotion.removeEventListener("change", this.onMotionPreference);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerdown", this.onPointerDown);
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("blur", this.onPointerLeave);
  }
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.resize(rect.width, rect.height, dpr);
    const refW = cellWidthFor(rect.width, REFERENCE_GLYPH_SCALE);
    this.world.resize(rect.width, rect.height, this.renderer.cellWidth, this.renderer.cellHeight, refW * cellHeightFor(refW));
    if (this.reducedMotion.matches) this.drawStill();
  }
  schedule() {
    cancelAnimationFrame(this.raf);
    if (this.disposed || !this.visible || this.reducedMotion.matches) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }
  /** Reduced motion: let the ecosystem settle, then show a single frame. */
  drawStill() {
    if (this.world.time < 4) {
      for (let i = 0; i < 240; i++) this.world.step(STEP);
    }
    this.renderer.render(this.world, STEP);
  }
  toLocal(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
    return { x, y, inside };
  }
}
const en = {
  pageTitle: "New Tab",
  googleServices: "Google services",
  images: "Images",
  googleApps: "Google apps",
  googleAccount: "Google Account",
  manageAccount: "Manage your Google Account",
  changeAvatar: "Change picture",
  removeAvatar: "Remove picture",
  searchPlaceholder: "Search Google or type a URL",
  search: "Search",
  shortcuts: "Shortcuts",
  customize: "Customize",
  close: "Close",
  appearance: "Appearance",
  theme: "Theme",
  light: "Light",
  dark: "Dark",
  system: "System",
  language: "Language",
  auto: "Auto",
  ocean: "Ocean",
  swimSpeed: "Swim speed",
  glyphSize: "Character size",
  fishAmount: "Fish amount",
  shimmer: "Shimmer",
  sharks: "Sharks",
  add: "Add",
  resetDefaults: "Reset to defaults",
  addShortcut: "Add shortcut",
  editShortcut: "Edit shortcut",
  edit: "Edit",
  name: "Name",
  url: "URL",
  remove: "Remove",
  cancel: "Cancel",
  save: "Save",
  shortcutError: "Enter a name and a valid http or https URL.",
  color: "Color",
  kind: "Type",
  size: "Size",
  resetColor: "Reset color",
  removeShark: "Remove this shark",
  // Shark kinds
  classic: "Classic",
  hammerhead: "Hammerhead",
  greathammer: "Great hammerhead",
  tiger: "Tiger",
  zebra: "Zebra",
  mako: "Mako",
  thresher: "Thresher",
  nurse: "Nurse",
  // Google apps
  appSearch: "Search",
  appMaps: "Maps",
  appDrive: "Drive",
  appCalendar: "Calendar",
  appTranslate: "Translate",
  appPhotos: "Photos",
  appDocs: "Docs",
  appSheets: "Sheets",
  appSlides: "Slides",
  appNews: "News"
};
const zh = {
  pageTitle: "新分頁",
  googleServices: "Google 服務",
  images: "圖片",
  googleApps: "Google 應用程式",
  googleAccount: "Google 帳戶",
  manageAccount: "管理你的 Google 帳戶",
  changeAvatar: "更換頭像",
  removeAvatar: "移除頭像",
  searchPlaceholder: "搜尋 Google 或輸入網址",
  search: "搜尋",
  shortcuts: "常用網站",
  customize: "自訂",
  close: "關閉",
  appearance: "外觀",
  theme: "主題",
  light: "淺色",
  dark: "深色",
  system: "系統",
  language: "語言",
  auto: "自動",
  ocean: "海洋",
  swimSpeed: "游動速度",
  glyphSize: "字元大小",
  fishAmount: "小魚數量",
  shimmer: "閃爍程度",
  sharks: "鯊魚",
  add: "新增",
  resetDefaults: "恢復預設",
  addShortcut: "新增捷徑",
  editShortcut: "編輯捷徑",
  edit: "編輯",
  name: "名稱",
  url: "網址",
  remove: "移除",
  cancel: "取消",
  save: "儲存",
  shortcutError: "請輸入名稱與有效的 http 或 https 網址。",
  color: "顏色",
  kind: "種類",
  size: "大小",
  resetColor: "恢復原色",
  removeShark: "移除這隻鯊魚",
  classic: "經典鯊",
  hammerhead: "雙髻鯊",
  greathammer: "大雙髻鯊",
  tiger: "虎鯊",
  zebra: "斑馬鯊",
  mako: "灰鯖鯊",
  thresher: "長尾鯊",
  nurse: "鉸口鯊",
  appSearch: "搜尋",
  appMaps: "地圖",
  appDrive: "雲端硬碟",
  appCalendar: "日曆",
  appTranslate: "翻譯",
  appPhotos: "相簿",
  appDocs: "文件",
  appSheets: "試算表",
  appSlides: "簡報",
  appNews: "新聞"
};
const languageKey = "ascii-sharks-lang";
function chosenLanguage() {
  try {
    const saved = localStorage.getItem(languageKey);
    if (saved === "en" || saved === "zh") return saved;
  } catch {
  }
  return "auto";
}
const languageChoice = chosenLanguage();
const lang = languageChoice === "auto" ? navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en" : languageChoice;
const strings = lang === "zh" ? zh : en;
function t(key2) {
  return strings[key2];
}
function isKey(key2) {
  return key2 in en;
}
function translatePage() {
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  document.title = t("pageTitle");
  for (const el of document.querySelectorAll("[data-i18n]")) {
    const key2 = el.dataset.i18n;
    if (isKey(key2)) el.textContent = t(key2);
  }
  for (const el of document.querySelectorAll("[data-i18n-label]")) {
    const key2 = el.dataset.i18nLabel;
    if (isKey(key2)) el.setAttribute("aria-label", t(key2));
  }
  for (const el of document.querySelectorAll("[data-i18n-placeholder]")) {
    const key2 = el.dataset.i18nPlaceholder;
    if (isKey(key2)) el.placeholder = t(key2);
  }
}
translatePage();
const extension = typeof chrome !== "undefined" && !!((_a = chrome.storage) == null ? void 0 : _a.local);
async function load(key2) {
  try {
    if (extension) return (await chrome.storage.local.get(key2))[key2];
    const raw = localStorage.getItem(key2);
    return raw === null ? void 0 : JSON.parse(raw);
  } catch {
    return void 0;
  }
}
async function store(key2, value) {
  try {
    if (extension) await chrome.storage.local.set({ [key2]: value });
    else localStorage.setItem(key2, JSON.stringify(value));
  } catch {
  }
}
function favicon(url, img, fallback) {
  if (!extension) return;
  img.src = chrome.runtime.getURL(`/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`);
  img.onload = () => fallback.replaceChildren(img);
}
function destination(value) {
  const text = value.trim();
  if (/^https?:\/\//i.test(text)) return new URL(text).href;
  if (/^(localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?([/?#]\S*)?$/.test(text)) return new URL(`https://${text}`).href;
  return `https://www.google.com/search?q=${encodeURIComponent(text)}`;
}
document.querySelector("#search").addEventListener("submit", (event) => {
  event.preventDefault();
  const text = document.querySelector("#query").value.trim();
  if (text) location.href = destination(text);
});
const oceanKey = "ascii-sharks-ocean";
const kinds = ["classic", "hammerhead", "greathammer", "tiger", "zebra", "mako", "thresher", "nurse"].map((kind) => [kind, t(kind)]);
const builtInColors = ["#3ad0e6", "#c25ae6", "#e6a038", "#4ad874"];
const defaultOcean = () => ({
  sharks: DEFAULT_SHARKS.map((s) => ({ ...s, color: null })),
  fishScale: 1,
  glyphScale: 0.6,
  speed: 1,
  shimmer: 0.3,
  theme: "dark"
});
let ocean = defaultOcean();
let engine;
const canvas = document.querySelector("canvas");
function startOcean() {
  engine == null ? void 0 : engine.destroy();
  engine = new OceanEngine(canvas, ocean.sharks.map(({ kind, size }) => ({ kind, size })), {
    fishScale: ocean.fishScale,
    glyphScale: ocean.glyphScale,
    speed: ocean.speed,
    shimmer: ocean.shimmer,
    sharkColors: ocean.sharks.map((s) => s.color),
    light: document.documentElement.dataset.theme === "light"
  });
}
function changeOcean(restart = true) {
  store(oceanKey, ocean);
  renderOcean();
  if (restart) startOcean();
}
const lightQuery = matchMedia("(prefers-color-scheme: light)");
function applyTheme() {
  try {
    localStorage.setItem("ascii-sharks-theme", ocean.theme);
  } catch {
  }
  const light = ocean.theme === "light" || ocean.theme === "system" && lightQuery.matches;
  document.documentElement.dataset.theme = light ? "light" : "dark";
  engine == null ? void 0 : engine.setLight(light);
}
lightQuery.addEventListener("change", applyTheme);
for (const button of document.querySelectorAll("[data-theme-choice]")) {
  button.addEventListener("click", () => {
    ocean.theme = button.dataset.themeChoice;
    applyTheme();
    changeOcean(false);
  });
}
for (const button of document.querySelectorAll("[data-lang-choice]")) {
  button.setAttribute("aria-checked", String(button.dataset.langChoice === languageChoice));
  button.addEventListener("click", () => {
    const choice = button.dataset.langChoice;
    if (choice === languageChoice) return;
    try {
      localStorage.setItem(languageKey, choice);
    } catch {
    }
    location.reload();
  });
}
const listbox = document.createElement("div");
listbox.className = "listbox";
listbox.setAttribute("role", "listbox");
listbox.popover = "auto";
document.querySelector("#ocean-panel").append(listbox);
let listboxOwner = null;
listbox.addEventListener("toggle", (event) => {
  if (event.newState === "closed") {
    listboxOwner == null ? void 0 : listboxOwner.setAttribute("aria-expanded", "false");
    listboxOwner = null;
  }
});
function dropdown(value, onPick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "dropdown";
  button.textContent = kinds.find(([k]) => k === value)[1];
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");
  button.addEventListener("click", () => {
    var _a2;
    const reopen = listboxOwner !== button;
    if (listboxOwner) listbox.hidePopover();
    if (!reopen) return;
    listbox.replaceChildren(...kinds.map(([kind, label]) => {
      const option = document.createElement("button");
      option.type = "button";
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", String(kind === value));
      option.textContent = label;
      option.addEventListener("click", () => {
        listbox.hidePopover();
        if (kind !== value) onPick(kind);
      });
      return option;
    }));
    listboxOwner = button;
    button.setAttribute("aria-expanded", "true");
    listbox.showPopover();
    const rect = button.getBoundingClientRect();
    const height = listbox.offsetHeight;
    const below = rect.bottom + 6 + height < innerHeight;
    listbox.style.left = `${rect.left}px`;
    listbox.style.top = `${below ? rect.bottom + 6 : Math.max(8, rect.top - 6 - height)}px`;
    (_a2 = listbox.querySelector("[aria-selected=true]")) == null ? void 0 : _a2.focus();
  });
  return button;
}
function fill(input) {
  const p = (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min));
  input.style.setProperty("--p", `${p * 100}%`);
}
document.addEventListener("input", (event) => {
  const input = event.target;
  if (input.type === "range") fill(input);
});
const sharkList = document.querySelector("#shark-list");
const sharkAdd = document.querySelector("#shark-add");
const sliders = [
  { id: "speed", get: () => ocean.speed, set: (v) => {
    ocean.speed = v;
    if (engine) engine.speed = v;
    return false;
  }, label: (v) => `${+v.toFixed(2)}×` },
  { id: "glyph-scale", get: () => ocean.glyphScale, set: (v) => {
    ocean.glyphScale = v;
    return true;
  }, label: (v) => `${Math.round(v * 100)}%` },
  { id: "shimmer", get: () => ocean.shimmer, set: (v) => {
    ocean.shimmer = v;
    engine == null ? void 0 : engine.setShimmer(v);
    return false;
  }, label: (v) => `${Math.round(v * 100)}%` },
  { id: "fish-scale", get: () => ocean.fishScale, set: (v) => {
    ocean.fishScale = v;
    return true;
  }, label: (v) => `${Math.round(v * 100)}%` }
].map((s) => ({
  ...s,
  input: document.querySelector(`#${s.id}`),
  output: document.querySelector(`#${s.id.split("-")[0]}-value`)
}));
for (const s of sliders) {
  s.input.addEventListener("input", () => {
    s.output.textContent = s.label(Number(s.input.value));
    if (s.id === "speed" || s.id === "shimmer") s.set(Number(s.input.value));
  });
  s.input.addEventListener("change", () => changeOcean(s.set(Number(s.input.value))));
}
function renderOcean() {
  sharkList.replaceChildren();
  ocean.sharks.forEach((shark, index) => {
    const row = document.createElement("div");
    row.className = "shark-row";
    const color = document.createElement("input");
    color.type = "color";
    color.value = shark.color ?? builtInColors[index % builtInColors.length];
    color.title = color.ariaLabel = t("color");
    color.addEventListener("change", () => {
      shark.color = color.value;
      changeOcean();
    });
    const kind = dropdown(shark.kind, (picked) => {
      shark.kind = picked;
      changeOcean();
    });
    kind.title = t("kind");
    const size = document.createElement("input");
    size.type = "range";
    size.min = "0.4";
    size.max = "1.3";
    size.step = "0.05";
    size.value = String(shark.size);
    size.title = size.ariaLabel = t("size");
    fill(size);
    size.addEventListener("change", () => {
      shark.size = Number(size.value);
      changeOcean();
    });
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "icon-button";
    reset.textContent = "↺";
    reset.title = reset.ariaLabel = t("resetColor");
    reset.disabled = shark.color === null;
    reset.addEventListener("click", () => {
      shark.color = null;
      changeOcean();
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "icon-button";
    remove.textContent = "✕";
    remove.title = remove.ariaLabel = t("removeShark");
    remove.disabled = ocean.sharks.length <= 1;
    remove.addEventListener("click", () => {
      ocean.sharks.splice(index, 1);
      changeOcean();
    });
    row.append(color, kind, size, reset, remove);
    sharkList.append(row);
  });
  document.querySelector("#shark-count").textContent = `${ocean.sharks.length} / 8`;
  sharkAdd.disabled = ocean.sharks.length >= 8;
  for (const s of sliders) {
    s.input.value = String(s.get());
    s.output.textContent = s.label(s.get());
    fill(s.input);
  }
  for (const button of document.querySelectorAll("[data-theme-choice]")) {
    button.setAttribute("aria-checked", String(button.dataset.themeChoice === ocean.theme));
  }
}
sharkAdd.addEventListener("click", () => {
  ocean.sharks.push({ kind: "classic", size: 0.8, color: null });
  changeOcean();
});
document.querySelector("#ocean-reset").addEventListener("click", () => {
  ocean = { ...defaultOcean(), theme: ocean.theme };
  changeOcean();
});
load(oceanKey).then((saved) => {
  const known = new Set(kinds.map(([k]) => k));
  const num = (v, fallback) => typeof v === "number" && isFinite(v) ? v : fallback;
  if (saved && Array.isArray(saved.sharks) && saved.sharks.length && saved.sharks.every((s) => known.has(s == null ? void 0 : s.kind) && typeof s.size === "number")) {
    const base = defaultOcean();
    ocean = {
      sharks: saved.sharks.slice(0, 8),
      fishScale: num(saved.fishScale, base.fishScale),
      glyphScale: num(saved.glyphScale, base.glyphScale),
      speed: num(saved.speed, base.speed),
      shimmer: num(saved.shimmer, base.shimmer),
      theme: saved.theme === "light" || saved.theme === "system" ? saved.theme : "dark"
    };
  }
  applyTheme();
  renderOcean();
  startOcean();
});
const apps = [
  [t("appSearch"), "https://www.google.com/"],
  [t("appMaps"), "https://maps.google.com/"],
  ["YouTube", "https://www.youtube.com/"],
  ["Gmail", "https://mail.google.com/"],
  ["Meet", "https://meet.google.com/"],
  [t("appDrive"), "https://drive.google.com/"],
  [t("appCalendar"), "https://calendar.google.com/"],
  [t("appTranslate"), "https://translate.google.com/"],
  [t("appPhotos"), "https://photos.google.com/"],
  [t("appDocs"), "https://docs.google.com/document/"],
  [t("appSheets"), "https://docs.google.com/spreadsheets/"],
  [t("appSlides"), "https://docs.google.com/presentation/"],
  ["Gemini", "https://gemini.google.com/"],
  ["Keep", "https://keep.google.com/"],
  [t("appNews"), "https://news.google.com/"]
];
const appsPanel = document.querySelector("#apps");
const appIcons = [];
for (const [name, url] of apps) {
  const a = document.createElement("a");
  a.href = url;
  const icon = document.createElement("span");
  icon.className = "app-icon";
  icon.textContent = name.slice(0, 1);
  appIcons.push([url, icon]);
  const label = document.createElement("span");
  label.textContent = name;
  a.append(icon, label);
  appsPanel.append(a);
}
let appIconsLoaded = false;
document.querySelector("#apps-button").addEventListener("click", () => {
  if (appIconsLoaded) return;
  appIconsLoaded = true;
  for (const [url, icon] of appIcons) {
    const img = new Image();
    img.alt = "";
    img.onload = () => icon.replaceChildren(img);
    img.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(url)}`;
  }
});
const menus = [["#apps-button", "#apps"], ["#avatar-button", "#account"], ["#ocean-button", "#ocean-panel"]].map(([b, p]) => [document.querySelector(b), document.querySelector(p)]);
function closeMenus(except) {
  for (const [button, panel] of menus) if (panel !== except) {
    panel.hidden = true;
    button.setAttribute("aria-expanded", "false");
  }
}
for (const [button, panel] of menus) button.addEventListener("click", (event) => {
  event.stopPropagation();
  closeMenus(panel);
  panel.hidden = !panel.hidden;
  button.setAttribute("aria-expanded", String(!panel.hidden));
});
document.addEventListener("click", (event) => {
  if (!event.composedPath().some((el) => el instanceof Element && el.classList.contains("panel"))) closeMenus();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenus();
});
document.querySelector("#ocean-close").addEventListener("click", () => closeMenus());
const avatarKey = "ascii-sharks-avatar";
const person = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2c-4 0-9 2-9 6v1h18v-1c0-4-5-6-9-6z"/></svg>';
function showAvatar(src) {
  for (const el of document.querySelectorAll(".avatar")) {
    if (src) {
      const img = new Image();
      img.src = src;
      img.alt = "";
      el.replaceChildren(img);
    } else el.innerHTML = person;
  }
  document.querySelector("#avatar-clear").hidden = !src;
}
const avatarFile = document.querySelector("#avatar-file");
document.querySelector("#avatar-change").addEventListener("click", () => avatarFile.click());
document.querySelector("#avatar-clear").addEventListener("click", () => {
  store(avatarKey, null);
  showAvatar(void 0);
});
avatarFile.addEventListener("change", () => {
  var _a2;
  const file = (_a2 = avatarFile.files) == null ? void 0 : _a2[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    const canvas2 = document.createElement("canvas");
    canvas2.width = canvas2.height = 128;
    const side = Math.min(img.width, img.height);
    canvas2.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 128, 128);
    const data = canvas2.toDataURL("image/png");
    URL.revokeObjectURL(img.src);
    store(avatarKey, data);
    showAvatar(data);
  };
  img.src = URL.createObjectURL(file);
  avatarFile.value = "";
});
load(avatarKey).then((src) => showAvatar(src ?? void 0));
const key = "ascii-sharks-shortcuts";
let links = [];
let editing = -1;
const editor = document.querySelector("#editor");
const form = document.querySelector("#shortcut-form");
const error = document.querySelector("#error");
const nameInput = document.querySelector("#link-name");
const urlInput = document.querySelector("#link-url");
const deleteButton = document.querySelector("#delete");
document.querySelector("#cancel").addEventListener("click", () => editor.close());
deleteButton.addEventListener("click", () => {
  links = links.filter((_, i) => i !== editing);
  save();
  editor.close();
});
function open(index) {
  var _a2, _b;
  editing = index;
  form.reset();
  error.textContent = "";
  nameInput.value = ((_a2 = links[index]) == null ? void 0 : _a2.name) ?? "";
  urlInput.value = ((_b = links[index]) == null ? void 0 : _b.url) ?? "";
  document.querySelector("#editor-title").textContent = index < 0 ? t("addShortcut") : t("editShortcut");
  deleteButton.hidden = index < 0;
  editor.showModal();
}
function save() {
  store(key, links);
  render();
}
function render() {
  const container = document.querySelector("#shortcuts");
  container.replaceChildren();
  links.forEach((link, index) => {
    const item = document.createElement("div");
    item.className = "shortcut";
    const a = document.createElement("a");
    a.href = link.url;
    const icon = document.createElement("span");
    icon.className = "icon";
    icon.textContent = link.name.slice(0, 1).toUpperCase();
    icon.style.setProperty("--accent", ["#74d9c5", "#e4a384", "#dde3ee", "#ff737e", "#d795ef"][index % 5]);
    favicon(link.url, new Image(), icon);
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = link.name;
    a.title = link.name;
    a.append(icon, label);
    const edit = document.createElement("button");
    edit.className = "edit";
    edit.textContent = "⋮";
    edit.setAttribute("aria-label", `${t("edit")} ${link.name}`);
    edit.addEventListener("click", () => open(index));
    item.append(a, edit);
    container.append(item);
  });
  const add = document.createElement("button");
  add.className = "add";
  add.innerHTML = '<span class="icon">＋</span><span class="label"></span>';
  add.querySelector(".label").textContent = t("addShortcut");
  add.addEventListener("click", () => open(-1));
  container.append(add);
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  const raw = urlInput.value.trim();
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`);
    if (!name || !["https:", "http:"].includes(url.protocol)) throw new Error();
    const link = { name, url: url.href };
    links = editing < 0 ? [...links, link] : links.map((l, i) => i === editing ? link : l);
    save();
    editor.close();
  } catch {
    error.textContent = t("shortcutError");
  }
});
function valid(saved) {
  return Array.isArray(saved) && saved.every((x) => typeof (x == null ? void 0 : x.name) === "string" && typeof (x == null ? void 0 : x.url) === "string" && /^https?:\/\//i.test(x.url));
}
render();
load(key).then((saved) => {
  if (valid(saved)) {
    links = saved;
    render();
  }
});
if (extension) chrome.storage.onChanged.addListener((changes, area) => {
  var _a2;
  if (area === "local" && valid((_a2 = changes[key]) == null ? void 0 : _a2.newValue)) {
    links = changes[key].newValue;
    render();
  }
});

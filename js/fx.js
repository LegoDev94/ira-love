// Визуальные эффекты: зерно плёнки, сердечки/конфетти/салют, дождь с молниями, звёзды, сердце из частиц.
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = () => Math.min(window.devicePixelRatio || 1, 2);

function heartPath(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(-s * 0.1, s * 0.15, -s * 0.55, s * 0.05, -s * 0.5, -s * 0.25);
  ctx.bezierCurveTo(-s * 0.45, -s * 0.55, -s * 0.05, -s * 0.55, 0, -s * 0.25);
  ctx.bezierCurveTo(s * 0.05, -s * 0.55, s * 0.45, -s * 0.55, s * 0.5, -s * 0.25);
  ctx.bezierCurveTo(s * 0.55, s * 0.05, s * 0.1, s * 0.15, 0, s * 0.3);
  ctx.closePath();
}

// ---------- зерно ----------
(function grain() {
  const c = document.createElement('canvas'); c.width = c.height = 180;
  const x = c.getContext('2d'), d = x.createImageData(180, 180);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0);
  document.querySelector('.grain').style.backgroundImage = `url(${c.toDataURL()})`;
})();

// ---------- частицы поверх всего ----------
window.FX = (() => {
  const c = document.getElementById('fx'), x = c.getContext('2d');
  const COLORS = ['#ff4d6d', '#ff8fa3', '#ffd166', '#c9a2d9', '#ffffff', '#ff7a59'];
  let W, H, parts = [], raf = null;
  function resize() { W = innerWidth; H = innerHeight; c.width = W * DPR(); c.height = H * DPR(); x.setTransform(DPR(), 0, 0, DPR(), 0, 0); }
  resize(); addEventListener('resize', resize);
  const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];

  function loop() {
    x.clearRect(0, 0, W, H);
    parts = parts.filter(p => p.life > 0 && p.y < H + 40);
    for (const p of parts) {
      p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= p.decay;
      x.save(); x.globalAlpha = Math.max(0, Math.min(1, p.life)); x.translate(p.x, p.y); x.rotate(p.rot);
      x.fillStyle = p.color;
      if (p.type === 'heart') { heartPath(x, p.size); x.fill(); }
      else if (p.type === 'confetti') { x.scale(1, Math.cos(p.rot * 3)); x.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); }
      else { x.shadowBlur = 12; x.shadowColor = p.color; x.beginPath(); x.arc(0, 0, p.size, 0, 6.28); x.fill(); }
      x.restore();
    }
    raf = parts.length ? requestAnimationFrame(loop) : (x.clearRect(0, 0, W, H), null);
  }
  function add(p) { parts.push(Object.assign({ vx: 0, vy: 0, g: 0, drag: 1, rot: 0, vr: 0, life: 1, decay: .01, size: 10, color: pick(COLORS), type: 'heart' }, p)); if (!raf) raf = requestAnimationFrame(loop); }

  return {
    hearts(cx, cy, n = 18) {
      for (let i = 0; i < n; i++) { const a = rnd(0, 6.28), s = rnd(2, 8); add({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3, g: .12, drag: .97, size: rnd(10, 24), vr: rnd(-.05, .05), decay: rnd(.008, .016) }); }
    },
    confetti(n = 160) {
      for (let i = 0; i < n; i++) add({ type: 'confetti', x: rnd(0, W), y: rnd(-H * .3, -10), vx: rnd(-2, 2), vy: rnd(2, 6), g: .05, drag: .995, size: rnd(8, 14), vr: rnd(-.15, .15), decay: rnd(.003, .006) });
    },
    firework(cx, cy) {
      const col = pick(COLORS), n = 70;
      for (let i = 0; i < n; i++) { const a = (i / n) * 6.28, s = rnd(3, 7); add({ type: 'spark', x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: .06, drag: .975, size: rnd(1.5, 3), color: col, decay: rnd(.012, .02) }); }
      for (let i = 0; i < 10; i++) { const a = rnd(0, 6.28), s = rnd(1, 4); add({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: .04, drag: .97, size: rnd(10, 18), decay: .01 }); }
    },
    trail(px, py) { add({ x: px, y: py, vx: rnd(-.6, .6), vy: rnd(-1.6, -.4), size: rnd(6, 11), decay: .025, color: pick(['#ff4d6d', '#ff8fa3', '#ffd166']) }); },
    rise(n = 30) { for (let i = 0; i < n; i++) add({ x: rnd(0, W), y: H + 20, vx: rnd(-.5, .5), vy: rnd(-4, -1.5), size: rnd(10, 26), decay: rnd(.004, .008), vr: rnd(-.02, .02) }); }
  };
})();

// курсор-сердечки (только мышь)
if (matchMedia('(pointer:fine)').matches && !REDUCED) {
  let last = 0;
  addEventListener('pointermove', e => { const t = performance.now(); if (t - last > 55 && document.body.classList.contains('playing')) { last = t; FX.trail(e.clientX, e.clientY); } });
}

// ---------- дождь и молнии ----------
window.Rain = (() => {
  const c = document.getElementById('rain'), x = c.getContext('2d'), flash = document.querySelector('.flash');
  let W, H, drops = [], level = 0, raf = null, boltTimer = null;
  function resize() { W = innerWidth; H = innerHeight; c.width = W * DPR(); c.height = H * DPR(); x.setTransform(DPR(), 0, 0, DPR(), 0, 0); }
  resize(); addEventListener('resize', resize);
  for (let i = 0; i < 420; i++) drops.push({ x: Math.random(), y: Math.random(), l: 10 + Math.random() * 22, v: 12 + Math.random() * 14 });
  function loop() {
    x.clearRect(0, 0, W, H);
    x.strokeStyle = 'rgba(190,210,255,.42)'; x.lineWidth = 1.1; x.beginPath();
    const n = Math.floor(drops.length * level);
    for (let i = 0; i < n; i++) {
      const d = drops[i]; d.y += d.v / H; if (d.y > 1.05) { d.y = -0.05; d.x = Math.random() * 1.1; }
      const px = d.x * W - d.y * 60, py = d.y * H;
      x.moveTo(px, py); x.lineTo(px - d.l * .25, py + d.l);
    }
    x.stroke();
    raf = level > 0 ? requestAnimationFrame(loop) : null;
  }
  function bolt() {
    if (REDUCED) return;
    gsap.timeline().to(flash, { opacity: .55, duration: .06 }).to(flash, { opacity: 0, duration: .12 }).to(flash, { opacity: .35, duration: .05 }).to(flash, { opacity: 0, duration: .6 });
    setTimeout(() => Sound.thunder(), 250);
  }
  function schedule() { clearTimeout(boltTimer); if (level > .5) boltTimer = setTimeout(() => { bolt(); schedule(); }, 4500 + Math.random() * 5000); }
  return {
    set(v) {
      const prev = level; level = REDUCED ? Math.min(v, .3) : v;
      c.style.opacity = v > 0 ? 1 : 0; Sound.rain(v);
      if (level > 0 && !raf) raf = requestAnimationFrame(loop);
      if (level > .5 && prev <= .5) { bolt(); schedule(); }
      if (level <= .5) clearTimeout(boltTimer);
    },
    get level() { return level; }, bolt
  };
})();

// ---------- звёзды (сцена 23:00) ----------
window.Stars = (() => {
  const c = document.getElementById('stars'), x = c.getContext('2d');
  let W, H, stars = [], shoot = null, raf = null, active = false;
  function resize() {
    const r = c.getBoundingClientRect(); W = r.width; H = r.height; c.width = W * DPR(); c.height = H * DPR(); x.setTransform(DPR(), 0, 0, DPR(), 0, 0);
    stars = Array.from({ length: Math.floor(W * H / 2600) }, () => ({ x: Math.random() * W, y: Math.random() * H * .7, r: Math.random() * 1.3 + .2, p: Math.random() * 6.28, s: .5 + Math.random() * 2 }));
  }
  function loop(t) {
    x.clearRect(0, 0, W, H);
    for (const s of stars) { x.globalAlpha = .35 + .65 * Math.abs(Math.sin(s.p + t / 1000 * s.s)); x.fillStyle = '#fff'; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.28); x.fill(); }
    if (!shoot && Math.random() < .006) shoot = { x: Math.random() * W * .8 + W * .2, y: Math.random() * H * .3, l: 0 };
    if (shoot) {
      shoot.l += 14; const g = x.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.l, shoot.y + shoot.l * .45);
      g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.globalAlpha = 1; x.strokeStyle = g; x.lineWidth = 2; x.beginPath(); x.moveTo(shoot.x, shoot.y); x.lineTo(shoot.x - Math.min(shoot.l, 180), shoot.y + Math.min(shoot.l, 180) * .45); x.stroke();
      shoot.x -= 9; shoot.y += 4; if (shoot.l > 400) shoot = null;
    }
    raf = active ? requestAnimationFrame(loop) : null;
  }
  addEventListener('resize', () => active && resize());
  return { on() { if (active) return; active = true; resize(); raf = requestAnimationFrame(loop); }, off() { active = false; } };
})();

// ---------- «Я ЛЮБЛЮ ТЕБЯ» из частиц ----------
window.LoveText = (() => {
  const c = document.getElementById('loveCanvas'), x = c.getContext('2d');
  let W, H, pts = [], targets = {}, mode = 'text', raf = null, active = false, mouse = { x: -999, y: -999 }, timer = null;
  function sample(draw) {
    const o = document.createElement('canvas'); o.width = W; o.height = H; const ox = o.getContext('2d');
    ox.fillStyle = '#fff'; draw(ox);
    const d = ox.getImageData(0, 0, W, H).data, out = [], step = W < 700 ? 5 : 7;
    for (let y = 0; y < H; y += step) for (let xx = 0; xx < W; xx += step) if (d[(y * W + xx) * 4 + 3] > 128) out.push({ x: xx, y });
    return out;
  }
  function build() {
    const r = c.getBoundingClientRect(); W = Math.floor(r.width); H = Math.floor(r.height);
    c.width = W * DPR(); c.height = H * DPR(); x.setTransform(DPR(), 0, 0, DPR(), 0, 0);
    const cy = innerHeight * .34, fs = Math.min(W / 5.2, 150, innerHeight * .13);
    targets.text = sample(ox => {
      ox.font = `800 ${fs}px "Playfair Display", serif`; ox.textAlign = 'center'; ox.textBaseline = 'middle';
      ox.fillText('Я ЛЮБЛЮ', W / 2, cy - fs * .55); ox.fillText('ТЕБЯ', W / 2, cy + fs * .55);
    });
    targets.heart = sample(ox => { ox.save(); ox.translate(W / 2, cy + fs * .2); heartPath(ox, Math.min(W * .85, fs * 3.4)); ox.fill(); ox.restore(); });
    const n = Math.max(targets.text.length, targets.heart.length);
    const cols = ['#ff4d6d', '#ff8fa3', '#ffd166', '#ffffff', '#c9a2d9'];
    pts = Array.from({ length: n }, (_, i) => pts[i] || { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, c: cols[i % cols.length], s: Math.random() * 1.4 + .9 });
    pts.length = n;
  }
  function loop() {
    x.clearRect(0, 0, W, H);
    const T = targets[mode];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], t = T[i % T.length];
      let dx = t.x - p.x, dy = t.y - p.y; p.vx += dx * .012; p.vy += dy * .012;
      const mx = p.x - mouse.x, my = p.y - mouse.y, md = mx * mx + my * my;
      if (md < 7000) { const f = (7000 - md) / 7000; p.vx += mx * f * .12; p.vy += my * f * .12; }
      p.vx *= .86; p.vy *= .86; p.x += p.vx; p.y += p.vy;
      x.fillStyle = p.c; x.fillRect(p.x, p.y, p.s * 1.6, p.s * 1.6);
    }
    raf = active ? requestAnimationFrame(loop) : null;
  }
  const move = e => { const r = c.getBoundingClientRect(), pt = e.touches ? e.touches[0] : e; mouse.x = pt.clientX - r.left; mouse.y = pt.clientY - r.top; };
  c.parentElement.addEventListener('pointermove', move);
  c.parentElement.addEventListener('touchmove', move, { passive: true });
  c.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
  addEventListener('resize', () => active && build());
  return {
    on() {
      if (active) return; active = true; build(); raf = requestAnimationFrame(loop);
      timer = setInterval(() => { mode = mode === 'text' ? 'heart' : 'text'; }, 4200);
    },
    off() { active = false; clearInterval(timer); },
    explode() { for (const p of pts) { p.vx += (Math.random() - .5) * 60; p.vy += (Math.random() - .5) * 60; } }
  };
})();

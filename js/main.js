gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const MOBILE = matchMedia('(max-width: 700px)').matches;

// ---------- имена из config.js ----------
$$('.me-name').forEach(e => (e.textContent = LOVE.me));

// ---------- загрузка графики от Codex (если файла ещё нет — остаётся заглушка) ----------
// на вертикальном экране (iPhone) сначала пробуем вертикальную версию фона: file-m.webp
const PORTRAIT = innerWidth / innerHeight < .8;
$$('[data-bg]').forEach(el => {
  const load = (src, fallback) => {
    const im = new Image();
    im.onload = () => { el.style.setProperty('--img', `url("${src}")`); el.classList.add('ok'); };
    im.onerror = () => fallback && load(fallback);
    im.src = src;
  };
  const src = el.dataset.bg;
  PORTRAIT && src.includes('/bg/') ? load(src.replace('.webp', '-m.webp'), src) : load(src);
});
$$('[data-src]').forEach(el => {
  const src = el.dataset.src, im = new Image();
  im.onload = () => {
    el.tagName.toLowerCase() === 'image' ? el.setAttribute('href', src) : (el.src = src);
    const box = el.closest('.asset'); box && box.classList.add('ok');
    ScrollTrigger.refresh();
  };
  im.src = src;
});

// ---------- плавный скролл ----------
let lenis = null;
if (window.Lenis && !REDUCED) {
  lenis = new Lenis({ duration: 1.25, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

// ---------- вход ----------
(function gate() {
  const lines = $$('.gate-line');
  lines.forEach(l => { l.dataset.text = l.textContent; l.textContent = ''; });
  const type = (el, i = 0) => new Promise(res => {
    const t = el.dataset.text, tick = () => { el.textContent = t.slice(0, ++i); i < t.length ? setTimeout(tick, 45 + Math.random() * 50) : res(); };
    tick();
  });
  (async () => {
    await new Promise(r => setTimeout(r, 700));
    for (const l of lines) { await type(l); await new Promise(r => setTimeout(r, 350)); }
    gsap.to('.gate-hint', { opacity: 1, duration: 1 });
    gsap.to('.gate-btn', { opacity: 1, y: 0, duration: 1, delay: .3 });
  })();
  $('#startBtn').addEventListener('click', e => {
    Sound.start(); Sound.chime();
    FX.hearts(e.clientX, e.clientY, 30);
    gsap.to('#gate', { opacity: 0, duration: 1.4, ease: 'power2.inOut', onComplete: () => $('#gate').remove() });
    document.body.classList.remove('locked'); document.body.classList.add('playing');
    window.scrollTo(0, 0); lenis && lenis.start();
    ScrollTrigger.refresh();
    titleIntro();
  });
})();

$('#soundBtn').addEventListener('click', () => $('#soundBtn').classList.toggle('off', !Sound.toggle()));

// ---------- HUD: таймкод, сцена, прогресс ----------
(function hud() {
  const tc = $('#timecode'), bar = $('#hudBar'), t0 = performance.now();
  const pad = n => String(n).padStart(2, '0');
  gsap.ticker.add(() => {
    const s = (performance.now() - t0) / 1000;
    tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(Math.floor(s) % 60)}:${pad(Math.floor(s * 24) % 24)}`;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  });
})();

// ---------- утилиты ----------
function splitWords(el) {
  if (el.dataset.split) return $$('.w', el);
  el.dataset.split = 1;
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
        else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
      });
      n.replaceWith(frag);
    } else if (n.tagName === 'SMALL') n.classList.add('w');
    else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
  });
  walk(el);
  return $$('.w', el);
}
// Кинематографичный показ и уход реплики внутри таймлайна
function capIn(tl, el, at, hold = 1) {
  const w = splitWords(el);
  tl.set(el, { opacity: 1 }, at)
    .fromTo(w, { opacity: 0, y: 26, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: .06, duration: .7, ease: 'power3.out' }, at)
    .to(w, { opacity: 0, y: -18, filter: 'blur(8px)', stagger: .03, duration: .5, ease: 'power2.in' }, at + .7 + hold);
}
function subIn(tl, el, at, hold = .9, stay = false) {
  tl.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .45 }, at);
  if (!stay) tl.to(el, { opacity: 0, y: -10, duration: .35 }, at + .45 + hold);
}
gsap.set('#clock, #polaroid', { xPercent: -50 });
gsap.set('#twist', { xPercent: -50, yPercent: -50 });
const pinScene = (id, len, opts = {}) => gsap.timeline({
  defaults: { ease: 'none' },
  scrollTrigger: Object.assign({ trigger: id, start: 'top top', end: `+=${len}%`, pin: true, scrub: 1, anticipatePin: 1 }, opts)
});

// ---------- ТИТУЛ ----------
function titleIntro() {
  const tl = gsap.timeline({ delay: .6 });
  tl.to('.presents', { opacity: 1, duration: 1.2 })
    .fromTo('.film-title span', { opacity: 0, y: 60, rotateX: -90, filter: 'blur(14px)' }, { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', stagger: .09, duration: 1.1, ease: 'power4.out' }, '-=.4')
    .to('.film-sub', { opacity: 1, duration: 1.2 }, '-=.3')
    .to('.film-cast', { opacity: 1, duration: 1 }, '-=.6')
    .to('.scroll-cue', { opacity: 1, duration: 1 });
  Sound.whoosh();
}
gsap.timeline({ scrollTrigger: { trigger: '#title', start: 'top top', end: '+=100%', pin: true, scrub: 1 } })
  .to('.film-title', { scale: 1.6, letterSpacing: '.3em', opacity: 0, filter: 'blur(12px)', ease: 'power1.in' }, 0)
  .to('.presents,.film-sub,.film-cast,.scroll-cue', { opacity: 0, y: -40 }, 0)
  .to('.title-glow', { scale: 2.2, opacity: 0 }, 0);

// ---------- 1. МАРКУЛЕШТЫ ----------
(function s1() {
  const tl = pinScene('#s1', 420, {
    onEnter: () => Sound.mood('warm'), onEnterBack: () => Sound.mood('warm'),
    onUpdate: self => { const p = self.progress; Sound.engine(p > .25 && p < .85 ? 1 - Math.abs(p - .55) * 3 : 0); },
    onLeave: () => Sound.engine(0), onLeaveBack: () => Sound.engine(0)
  });
  const caps = $$('#s1 .cap');
  tl.fromTo('#s1 .bg', { scale: 1.15, yPercent: 4 }, { scale: 1, yPercent: 0, duration: 10 }, 0)
    .fromTo('#walkers', { xPercent: -40 }, { xPercent: 60, duration: 10 }, 0)
    .fromTo('#fg1', { xPercent: 4 }, { xPercent: -6, duration: 10 }, 0);
  capIn(tl, caps[0], .2, .8);
  capIn(tl, caps[1], 1.8, .8);
  // машина въезжает справа
  tl.fromTo('#car1', { left: '105%' }, { left: '48%', duration: 2.6, ease: 'power1.out' }, 3)
    .fromTo('#beam1', { left: '100%', opacity: 0 }, { left: '30%', opacity: .9, duration: 2.6 }, 3);
  capIn(tl, caps[2], 3.2, .6);
  // замедление времени
  tl.to('#slowmo', { opacity: 1, duration: .3 }, 5.4)
    .to('#s1 .stage', { filter: 'saturate(1.35) contrast(1.05)', duration: .4 }, 5.4)
    .to('#car1', { left: '36%', duration: 2.2 }, 5.6)
    .to('#beam1', { left: '18%', duration: 2.2 }, 5.6)
    .call(() => Sound.heartbeat(), null, 5.8);
  tl.add(() => {
    const r = $('#walkers').getBoundingClientRect(), st = $('#s1 .stage').getBoundingClientRect();
    gsap.set('#focusRing', { left: r.left - st.left + r.width * .3, top: r.top - st.top + r.height * .35 });
  }, 5.5)
    .fromTo('#focusRing', { opacity: 0, scale: 2 }, { opacity: 1, scale: 1, duration: .6 }, 5.6)
    .to('#focusRing', { opacity: 0, duration: .4 }, 7.4);
  capIn(tl, caps[3], 5.6, 1);
  tl.to('#slowmo', { opacity: 0, duration: .3 }, 7.6)
    .to('#s1 .stage', { filter: 'none', duration: .4 }, 7.6)
    .to('#car1', { left: '-60%', duration: 1.6, ease: 'power2.in' }, 7.8)
    .to('#beam1', { left: '-60%', opacity: 0, duration: 1.6, ease: 'power2.in' }, 7.8);
  capIn(tl, caps[4], 8.4, .8);
  tl.to({}, { duration: .4 });
})();

// ---------- 2. КРУГ ----------
(function s2() {
  const map = $('#map');
  const setView = () => map.setAttribute('viewBox', innerWidth / innerHeight < 1 ? '230 70 580 440' : '0 0 1000 600');
  setView(); addEventListener('resize', setView);
  const trail = $('#trail'), L = trail.getTotalLength();
  gsap.set(trail, { strokeDasharray: L, strokeDashoffset: L });
  const lap = $('#lapCount'), pulse = $('#pulse');
  const tl = pinScene('#s2', 420, {
    onUpdate: self => {
      const p = self.progress;
      lap.textContent = p > .62 ? 1 : 0;
      pulse.textContent = Math.round(72 + Math.min(1, p * 1.15) * 66);
    }
  });
  tl.to('#carTop', { duration: 10, ease: 'none', motionPath: { path: '#trail', align: '#trail', alignOrigin: [.5, .5], autoRotate: true } }, 0)
    .to(trail, { strokeDashoffset: 0, duration: 10, ease: 'none' }, 0)
    .fromTo('#map', { scale: 1.08 }, { scale: 1, duration: 10 }, 0);
  const caps = $$('#s2 .cap');
  capIn(tl, caps[0], .4, .6);
  capIn(tl, caps[1], 2, .8);
  capIn(tl, caps[2], 4, 1.2);
  capIn(tl, caps[3], 6.6, .6);
  capIn(tl, caps[4], 8.4, .8);
  tl.call(() => Sound.pop(), null, 6.2).call(() => Sound.whoosh(), null, 8.6);
})();

// ---------- 3. ДОРОГА ДО ГОРОДКА ----------
(function s3() {
  const tl = pinScene('#s3', 600);
  const subs = $$('#s3 .sub'), car = $('#car3');
  tl.fromTo('#s3 .bg', { scale: 1.1 }, { scale: 1, duration: 13.5 }, 0)
    // Ира с мамой стоят по центру на тротуаре; машина тормозит перед ними, водительским окном к ним
    .fromTo('#standing', { xPercent: -50, y: 20, opacity: 0 }, { xPercent: -50, y: 0, opacity: 1, duration: 1 }, 0)
    .fromTo(car, { left: () => innerWidth * 1.05 }, { left: () => innerWidth * .5 - car.offsetWidth * .45, duration: 1.8, ease: 'power3.out' }, .2)
    .fromTo(car, { rotate: 0 }, { rotate: -1.2, duration: .25, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 1.75)
    // диалог окончен — машина уезжает, они остаются стоять
    .call(() => Sound.whoosh(), null, 10.5)
    .to(car, { left: () => -car.offsetWidth * 1.1, duration: 1.4, ease: 'power2.in' }, 10.5);
  subIn(tl, subs[0], 1.6, 1);
  tl.fromTo('#stamp', { opacity: 0, scale: 3, rotate: -24 }, { opacity: 1, scale: 1, rotate: -12, duration: .35, ease: 'back.out(2)' }, 2.4)
    .call(() => Sound.pop(), null, 2.45)
    .to('#stamp', { opacity: 0, duration: .4 }, 3.8);
  subIn(tl, subs[1], 3.4, .9);
  subIn(tl, subs[2], 4.9, .9);
  subIn(tl, subs[3], 6.3, .5);
  subIn(tl, subs[4], 7.4, .9);
  subIn(tl, subs[5], 8.8, 1);
  tl.to('#ask', { opacity: 1, visibility: 'visible', duration: .8 }, 12.4)
    .fromTo('#ask > *', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: .2, duration: .6 }, 12.6)
    .to({}, { duration: 1 });
  $('#notAgainstBtn').addEventListener('click', e => {
    FX.hearts(e.clientX, e.clientY, 40); Sound.chime();
    e.currentTarget.textContent = 'Я тоже был не против ❤️';
  });
})();

// ---------- 4. TELEGRAM ----------
(function s4() {
  const tl = pinScene('#s4', 360);
  const msgs = $$('#tgBody .msg'), body = $('#tgBody'), feed = $('#tgFeed');
  tl.from('.tg-side > *', { opacity: 0, y: 40, stagger: .3, duration: .8 }, 0)
    .from('.phone', { y: 120, rotate: 6, opacity: 0, duration: 1, ease: 'power3.out' }, 0);
  msgs.forEach((m, i) => {
    const at = 1.2 + i * 1;
    if (m.classList.contains('her')) {
      tl.to('#typing', { opacity: 1, duration: .2 }, at - .45).to('#typing', { opacity: 0, duration: .1 }, at - .05);
    }
    tl.to(m, { opacity: 1, y: 0, scale: 1, duration: .4, ease: 'back.out(1.6)' }, at)
      .call(() => Sound.pop(), null, at);
  });
  // лента сообщений поднимается, чтобы новые были видны
  tl.to(feed, { y: () => -Math.max(0, feed.offsetHeight - body.clientHeight + 16), duration: msgs.length - 2 }, 3);
  tl.to({}, { duration: .8 });
})();

// ---------- 5. 23:00 ----------
(function s5() {
  const WISHES = [
    'Ты светишь ярче, чем все эти звёзды.',
    'В ту ночь я впервые не хотел, чтобы ночь заканчивалась.',
    'Загадал тебя. Сбылось.',
    'С тобой даже ночь — тёплая.',
    'Ты смеялась — и мне больше ничего не было нужно.',
    'Ты — моё самое смелое решение.',
    'Ты — моя самая красивая случайность.',
    'Каждая звезда тут — это раз, когда я о тебе подумал. Просто их больше не поместилось.'
  ];
  const POS = [[12, 12], [30, 7], [80, 10], [90, 24], [8, 34], [70, 38], [46, 6], [22, 45]];
  const box = $('#starWishes'); let pop = null;
  WISHES.forEach((w, i) => {
    const b = document.createElement('button'); b.className = 'wish'; b.setAttribute('aria-label', 'Звезда');
    b.style.left = POS[i][0] + '%'; b.style.top = (POS[i][1] + 8) + '%';
    b.addEventListener('click', e => {
      b.classList.add('seen'); Sound.pop();
      pop && pop.remove(); pop = document.createElement('div'); pop.className = 'wish-pop'; pop.textContent = w;
      const left = Math.min(Math.max(POS[i][0], 22), 78);
      pop.style.left = left + '%'; pop.style.top = (POS[i][1] + 8) + '%';
      if (POS[i][1] < 15) pop.style.transform = 'translate(-50%, 40%)';
      box.appendChild(pop);
      gsap.fromTo(pop, { opacity: 0, scale: .8 }, { opacity: 1, scale: 1, duration: .4, ease: 'back.out(2)' });
      FX.hearts(e.clientX, e.clientY, 10);
    });
    box.appendChild(b);
  });
  const tl = pinScene('#s5', 300, {
    onEnter: () => { Stars.on(); Sound.mood('night'); }, onEnterBack: () => { Stars.on(); Sound.mood('night'); },
    onLeave: () => Stars.off(), onLeaveBack: () => { Stars.off(); Sound.mood('warm'); }
  });
  tl.fromTo('#s5 .bg', { scale: 1.12 }, { scale: 1, duration: 8 }, 0)
    .from('#clock', { opacity: 0, y: -40, duration: .6 }, 0)
    .call(() => { $('#d3').textContent = '5'; $('#d4').textContent = '9'; $('#clock').classList.remove('hit'); }, null, .9)
    .to('#clock .digit:nth-of-type(3) span, #clock .digit:nth-of-type(4) span', { rotateX: 90, duration: .2 }, 1)
    .call(() => { $('#d3').textContent = '0'; $('#d4').textContent = '0'; $('#clock').classList.add('hit'); Sound.chime(); }, null, 1.2)
    .to('#clock .digit:nth-of-type(3) span, #clock .digit:nth-of-type(4) span', { rotateX: 0, duration: .2 }, 1.2)
    .fromTo('#headlights', { opacity: 0, scale: .4 }, { opacity: 1, scale: 1.2, duration: 1.4 }, 1.4)
    .to('#headlights', { opacity: 0, duration: .6 }, 3.2)
    .to('#clock', { opacity: 0, y: -30, scale: .8, duration: .5 }, 4.6);
  const caps = $$('#s5 .cap');
  capIn(tl, caps[0], 1.6, .8);
  capIn(tl, caps[1], 3.2, .8);
  tl.set(caps[2], { opacity: 1 }, 5).fromTo(caps[2], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .4 }, 5)
    .fromTo('.wish', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: .08, duration: .3 }, 5)
    .to({}, { duration: 2.5 });

})();

// ---------- 6. ЗАПРАВКА ----------
(function s6() {
  const tl = pinScene('#s6', 260);
  tl.fromTo('#s6 .bg', { scale: 1.15 }, { scale: 1, duration: 8 }, 0)
    .fromTo('#polaroid', { opacity: 0, y: 80, rotate: 8 }, { opacity: 1, y: 0, rotate: -4, duration: 1.2, ease: 'power3.out' }, 2.2)
    .from('.cups .cup', { y: 120, opacity: 0, stagger: .2, duration: .8, ease: 'back.out(1.6)' }, .4);
  const caps = $$('#s6 .cap');
  capIn(tl, caps[0], .3, .8);
  capIn(tl, caps[1], 1.9, .8);
  capIn(tl, caps[2], 3.6, 1.2);
  tl.set(caps[3], { opacity: 1 }, 5.6).fromTo(caps[3], { opacity: 0 }, { opacity: 1, duration: .3 }, 5.6).to({}, { duration: 1.5 });
  $$('.cup').forEach(c => c.addEventListener('click', e => {
    Sound.clink(); FX.hearts(e.clientX, e.clientY - 40, 14);
    gsap.fromTo('.cup[data-cup="1"]', { x: 0 }, { x: 18, duration: .15, yoyo: true, repeat: 1 });
    gsap.fromTo('.cup[data-cup="2"]', { x: 0 }, { x: -18, duration: .15, yoyo: true, repeat: 1 });
  }));
})();

// ---------- 7. СЮЖЕТНЫЙ ПОВОРОТ ----------
(function s7() {
  const tl = pinScene('#s7', 480);
  const subs = $$('#s7 .sub'), caps = $$('#s7 .cap');
  tl.fromTo('#s7 .bg', { scale: 1.1 }, { scale: 1, duration: 12 }, 0);
  subIn(tl, subs[0], .2, .8);
  subIn(tl, subs[1], 1.6, .8);
  subIn(tl, subs[2], 3, .6);
  subIn(tl, subs[3], 4.2, .8);
  tl.to('#police', { opacity: 1, duration: .3 }, 5.5)
    .call(() => { Sound.heartbeat(); Sound.whoosh(); }, null, 5.6)
    .fromTo('#twist span', { opacity: 0, scale: 2.4, filter: 'blur(20px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', stagger: .35, duration: .5, ease: 'power4.out' }, 5.6)
    .to('#twist', { x: 8, duration: .05, repeat: 7, yoyo: true }, 6.6)
    .fromTo('#twistJoke', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .4 }, 7)
    .to('#twist, #twistJoke', { opacity: 0, scale: .9, duration: .5 }, 8.4)
    .fromTo('#audi', { left: '-40%' }, { left: '30%', duration: 1.2, ease: 'power2.out' }, 8.6)
    .to('#audi', { left: '120%', duration: 1.4, ease: 'power2.in' }, 10.4)
    .to('#police', { opacity: .25, duration: .6 }, 10.6)
    .to('#police', { opacity: 0, duration: .6 }, 12.6);
  capIn(tl, caps[0], 8.8, 1);
  capIn(tl, caps[1], 10.6, .8);
  capIn(tl, caps[2], 12.2, 1.2);
})();

// ---------- 8. 4 ИЮНЯ ----------
(function s8() {
  let partied = false;
  $$('#calendar .sheet').forEach((s, i, a) => (s.style.zIndex = a.length - i));
  const tl = pinScene('#s8', 300);
  tl.from('#s8 .kicker', { opacity: 0, y: 20, duration: .5 }, 0)
    .from('#calendar', { opacity: 0, scale: .7, rotate: -6, duration: .8, ease: 'back.out(1.5)' }, 0);
  $$('#calendar .sheet:not(.last)').forEach((s, i) => {
    tl.to(s, { rotateX: 110, y: -40, opacity: 0, duration: .45, ease: 'power2.in' }, 1 + i * .45)
      .call(() => Sound.pop(), null, 1 + i * .45);
  });
  const end = 1 + 6 * .45;
  tl.fromTo('#calendar .last', { scale: 1 }, { scale: 1.12, duration: .3, yoyo: true, repeat: 1 }, end)
    .call(() => { if (!partied && tl.scrollTrigger.direction > 0) { partied = true; FX.confetti(180); Sound.fanfare(); } }, null, end + .1)
    .to('#s8 .kicker', { opacity: 0, duration: .3 }, end)
    .to('#calText', { opacity: 1, duration: .8 }, end + .3)
    .to('#counter', { opacity: 1, duration: .8 }, end + 1.4)
    .to({}, { duration: 1.6 });

  const start = new Date(LOVE.together).getTime();
  const fun = $('#cntFun');
  const upd = () => {
    let s = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const d = Math.floor(s / 86400); s -= d * 86400;
    $('#cD').textContent = d; $('#cH').textContent = Math.floor(s / 3600); $('#cM').textContent = Math.floor(s / 60) % 60; $('#cS').textContent = s % 60;
    fun.textContent = `это ~${(d * 24 * 60 * 75).toLocaleString('ru-RU')} ударов моего сердца — и все про тебя`;
  };
  upd(); setInterval(upd, 1000);
})();

// ---------- 9. ШТОРМ ----------
(function s9() {
  const tl = pinScene('#s9', 380, {
    onEnter: () => { Rain.set(1); Sound.mood('storm'); },
    onEnterBack: () => { if (!$('#s10').classList.contains('cleared')) Rain.set(1); Sound.mood('storm'); },
    onLeaveBack: () => { Rain.set(0); Sound.mood('night'); }
  });
  tl.fromTo('#s9 .bg', { scale: 1.2 }, { scale: 1, duration: 12 }, 0);
  const caps = $$('#s9 .cap');
  [0, 2, 4, 6.2, 8.4, 10.4].forEach((at, i) => capIn(tl, caps[i], at, i === 4 ? 1.2 : .9));
  tl.call(() => Rain.bolt(), null, 6.1);
})();

// ---------- 10. ПРОСТИ ----------
(function s10() {
  const sec = $('#s10'), btn = $('#holdBtn'), ring = $('#holdRing'), C = 339.3;
  let prog = 0, holding = false, raf = null, done = false, beatT = 0;
  ScrollTrigger.create({ trigger: '#s10', start: 'bottom 40%', onEnter: () => Rain.set(0), onLeaveBack: () => !done && Rain.set(1) });
  const step = () => {
    prog = Math.max(0, Math.min(1, prog + (holding ? 0.0075 : -0.02)));
    ring.style.strokeDashoffset = C * (1 - prog);
    if (!done) Rain.set(1 - prog * .85);
    if (holding && performance.now() - beatT > 650) { beatT = performance.now(); Sound.heartbeat(); }
    if (prog >= 1 && !done) return finish();
    raf = (holding || prog > 0) ? requestAnimationFrame(step) : null;
  };
  const down = e => { if (done) return; e.preventDefault(); holding = true; btn.classList.add('active'); if (!raf) raf = requestAnimationFrame(step); };
  const up = () => { holding = false; btn.classList.remove('active'); };
  btn.addEventListener('pointerdown', down);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, up));
  btn.addEventListener('contextmenu', e => e.preventDefault());
  function finish() {
    done = true; holding = false; btn.classList.remove('active'); raf = null;
    Rain.set(0); Sound.mood('dawn'); Sound.chime(); FX.rise(40);
    sec.classList.add('cleared');
    $('.hold-wrap .kicker').textContent = 'Дождь закончился. Спасибо, что ты здесь.';
    $('#holdHint').textContent = '';
    gsap.to(btn, { scale: 1.2, duration: .3, yoyo: true, repeat: 1 });
  }
  // «Прости меня» — огромная кинетическая надпись
  gsap.fromTo('#sorry span', { opacity: 0, y: 80, filter: 'blur(20px)', letterSpacing: '.3em' }, {
    opacity: 1, y: 0, filter: 'blur(0px)', letterSpacing: '0em', stagger: .3, ease: 'power3.out',
    scrollTrigger: { trigger: '#sorry', start: 'top 85%', end: 'top 35%', scrub: 1 }
  });
  // письмо разворачивается
  gsap.fromTo('.letter-paper', { rotateX: -70, opacity: 0, y: 60 }, {
    rotateX: 0, opacity: 1, y: 0, ease: 'power2.out',
    scrollTrigger: { trigger: '#letter', start: 'top 90%', end: 'top 40%', scrub: 1 }
  });
  gsap.from('.letter-paper p', {
    opacity: 0, y: 16, stagger: .15,
    scrollTrigger: { trigger: '#letter', start: 'top 55%', end: 'bottom 75%', scrub: 1 }
  });
})();

// ---------- 11. ОБЕЩАНИЯ ----------
(function s11() {
  gsap.from('.promise', { y: 80, opacity: 0, rotate: () => gsap.utils.random(-6, 6), stagger: .12, duration: .9, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.promises', start: 'top 80%' } });
  $$('.promise').forEach(p => p.addEventListener('click', e => {
    p.classList.toggle('open');
    if (p.classList.contains('open')) { Sound.pop(); FX.hearts(e.clientX, e.clientY, 8); }
  }));
  gsap.from('#s11 .section-title', { opacity: 0, y: 40, scrollTrigger: { trigger: '#s11', start: 'top 70%', end: 'top 30%', scrub: 1 } });
})();

// ---------- 12. ПОЧЕМУ ТЫ ----------
(function s12() {
  const R = [
    'Твоя улыбка. Из-за неё я сделал тот самый круг.',
    'Ты умеешь успокоить всех. Даже маму. Даже полицию.',
    'Ты согласилась пить чай в 11 ночи с почти незнакомцем. Смелая.',
    'С тобой обычная заправка — лучшее место на земле.',
    'Твои глаза. Просто твои глаза.',
    'Ты чувствуешь всё очень глубоко — и поэтому ты настоящая.',
    'Ты красивая. Утром, вечером, сонная, в кроссовках — всегда.',
    'Ты смеёшься над моими шутками. Даже над несмешными.',
    'Ты — мой лучший подарок на день рождения. Навсегда.',
    'Рядом с тобой мне хочется быть лучше. Правда.',
    'Твои светлые волосы на солнце — отдельный вид искусства.',
    'Ты заботишься о других, даже когда тебе самой тяжело.',
    'Ты не сдаёшься. После каждой ссоры ты всё равно со мной.',
    'Ты умеешь радоваться мелочам — и учишь этому меня.',
    'С тобой я не знаю дороги — и мне не нужно её знать.',
    'Ты пахнешь как «всё будет хорошо».',
    'Ты сильнее, чем думаешь.',
    'Как ты смотришь на меня, когда думаешь, что я не вижу.',
    'Ты — человек, которому я хочу звонить первым.',
    'Твоя мама вырастила лучшего человека на свете.',
    'Ты выбираешь меня. Каждый день. Спасибо.',
    'Ты красивее любого заката в Маркулештах.',
    'Ты — моя самая любимая привычка.',
    'С тобой даже молчать уютно.',
    'Ты делаешь меня мягче. Я учусь. Дай мне время.',
    'Ты умеешь прощать. Это редкий дар.',
    'Твой голос, когда ты сонная.',
    'Ты — мой дом. Где бы мы ни были.',
    'Ты — лучшее, что случилось со мной в том посёлке. И вообще.',
    'Потому что ты — Ира. Этого достаточно.'
  ];
  const card = $('#reasonCard'), txt = $('#reasonText'), num = $('#reasonN');
  let i = 0;
  const show = () => {
    const last = i >= R.length;
    num.textContent = last ? '∞' : String(i + 1).padStart(2, '0') + ' / ' + R.length;
    txt.textContent = last ? 'А остальные бесконечность причин я скажу тебе лично. Глядя в глаза.' : R[i];
    i = last ? 0 : i + 1;
  };
  $('#reasonBtn').addEventListener('click', e => {
    Sound.pop();
    gsap.timeline()
      .to(card, { x: 260, rotate: 18, opacity: 0, duration: .35, ease: 'power2.in' })
      .call(show)
      .fromTo(card, { x: -60, rotate: -8, opacity: 0, scale: .9 }, { x: 0, rotate: 0, opacity: 1, scale: 1, duration: .5, ease: 'back.out(1.6)' });
    if (i >= R.length - 1) FX.hearts(e.clientX, e.clientY, 30);
  });
  show();
  gsap.from('.deck', { y: 100, opacity: 0, rotate: -6, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.deck', start: 'top 85%' } });
  gsap.from('#s12 .section-title', { opacity: 0, y: 40, scrollTrigger: { trigger: '#s12', start: 'top 70%', end: 'top 30%', scrub: 1 } });
})();

// ---------- 13. ФИНАЛ ----------
(function s13() {
  ScrollTrigger.create({
    trigger: '#s13', start: 'top 80%', end: 'bottom top',
    onToggle: self => { if (self.isActive) { LoveText.on(); Sound.mood('dawn'); } else LoveText.off(); }
  });
  // фото «проявляется», как полароид
  gsap.fromTo('#couple img', { filter: 'brightness(2.2) saturate(0) blur(6px)' }, { filter: 'brightness(1) saturate(1) blur(0px)', ease: 'none',
    scrollTrigger: { trigger: '#couple', start: 'top 90%', end: 'top 35%', scrub: 1 } });
  gsap.from('.final-ui > :not(.final-msg)', { opacity: 0, y: 50, stagger: .2, scrollTrigger: { trigger: '.final-ui', start: 'top 85%', end: 'top 45%', scrub: 1 } });

  const no = $('#noBtn'), yes = $('#yesBtn'), wrap = $('#answers');
  const NO_TEXT = ['Точно нет?', 'Подумай ещё 🥺', 'Ну пожалуйста', 'Я же круг ради тебя сделал', 'А если с массажем?', 'Кнопка устала', 'Ладно, это тоже «да»'];
  let n = 0;
  const dodge = e => {
    e && e.preventDefault();
    if (n >= NO_TEXT.length - 1) { no.textContent = 'Да ❤️'; no.onclick = () => yes.click(); no.style.transform = 'none'; return; }
    no.textContent = NO_TEXT[n++];
    const r = wrap.getBoundingClientRect(), mx = Math.max(60, r.width / 2 - 70);
    no.style.transform = `translate(${gsap.utils.random(-mx, mx)}px, ${gsap.utils.random(-120, 60)}px) scale(${Math.max(.6, 1 - n * .06)})`;
    yes.style.transform = `scale(${1 + n * .12})`;
    Sound.pop();
  };
  no.addEventListener('pointerenter', e => e.pointerType === 'mouse' && dodge());
  no.addEventListener('click', dodge);

  yes.addEventListener('click', e => {
    Sound.fanfare(); LoveText.explode(); FX.confetti(220);
    const fire = k => FX.firework(gsap.utils.random(innerWidth * .15, innerWidth * .85), gsap.utils.random(innerHeight * .15, innerHeight * .5));
    for (let k = 0; k < 7; k++) setTimeout(() => { fire(k); Sound.pop(); }, k * 380);
    FX.hearts(e.clientX, e.clientY, 50);
    gsap.to('#answers, .question', { opacity: 0, y: -20, duration: .5, onComplete: () => { $('#answers').style.display = 'none'; } });
    const msg = $('#finalMsg'); msg.style.display = 'block';
    if (LOVE.telegram) { const a = $('#tgLink'); a.href = 'https://t.me/' + LOVE.telegram.replace('@', ''); a.style.display = 'inline-flex'; }
    gsap.fromTo('#finalMsg > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: .25, delay: .5, duration: .8 });
    setInterval(() => document.visibilityState === 'visible' && FX.rise(6), 1800);
  });
})();

// ---------- ТИТРЫ ----------
gsap.timeline({ scrollTrigger: { trigger: '#credits', start: 'top top', end: '+=260%', pin: true, scrub: 1 } })
  .fromTo('#roll', { yPercent: 0 }, { yPercent: -100, y: () => -innerHeight * .15, ease: 'none' });
$('#replayBtn').addEventListener('click', () => (lenis ? lenis.scrollTo(0, { duration: 4 }) : scrollTo({ top: 0, behavior: 'smooth' })));

addEventListener('load', () => ScrollTrigger.refresh());
document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());

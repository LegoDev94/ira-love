// Звук, который рождается прямо в браузере: эмбиент-пэд, музыкальная шкатулка, дождь, мотор, эффекты.
// Если положить свою песню в assets/audio/our-song.mp3 — играет она, а пэд молчит.
window.Sound = (() => {
  let ctx, master, music, sfx, verb, padFilter, rainGain, engineGain;
  let enabled = true, started = false, song = null, mood = 'warm', chordIdx = 0, timers = [];
  const CHORDS = {
    warm:  [[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,66]],
    night: [[50,57,60,65],[46,53,57,62],[43,50,53,58],[45,52,55,60]],
    storm: [[45,52,55,60],[41,48,51,56],[43,50,53,58],[40,47,50,55]],
    dawn:  [[53,57,60,64],[55,59,62,67],[57,60,64,67],[52,55,59,64]]
  };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const now = () => ctx.currentTime;

  function impulse(sec = 3.2) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    return b;
  }
  function noiseBuf(sec = 2) {
    const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  function init() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    verb = ctx.createConvolver(); verb.buffer = impulse();
    const verbGain = ctx.createGain(); verbGain.gain.value = 0.55;
    verb.connect(verbGain).connect(master);
    music = ctx.createGain(); music.gain.value = 0.0;
    padFilter = ctx.createBiquadFilter(); padFilter.type = 'lowpass'; padFilter.frequency.value = 1100; padFilter.Q.value = 0.4;
    padFilter.connect(music); music.connect(master); music.connect(verb);
    sfx = ctx.createGain(); sfx.gain.value = 0.7; sfx.connect(master); sfx.connect(verb);

    // дождь
    const rn = ctx.createBufferSource(); rn.buffer = noiseBuf(3); rn.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 700;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000;
    rainGain = ctx.createGain(); rainGain.gain.value = 0;
    rn.connect(hp).connect(lp).connect(rainGain).connect(master); rn.start();

    // мотор
    engineGain = ctx.createGain(); engineGain.gain.value = 0;
    const elp = ctx.createBiquadFilter(); elp.type = 'lowpass'; elp.frequency.value = 180;
    [38, 76.5].forEach(f => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(elp); o.start(); });
    elp.connect(engineGain).connect(master);
  }

  function padChord() {
    const notes = CHORDS[mood][chordIdx++ % 4], t = now(), dur = 8;
    notes.forEach((m, i) => {
      ['triangle', 'sawtooth'].forEach((type, k) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.value = hz(m); o.detune.value = (k ? 7 : -5) + i;
        const peak = (type === 'sawtooth' ? 0.018 : 0.04);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 2.6);
        g.gain.setValueAtTime(peak, t + dur - 1); g.gain.linearRampToValueAtTime(0, t + dur + 2.5);
        o.connect(g).connect(padFilter); o.start(t); o.stop(t + dur + 3);
      });
    });
    // бас
    const b = ctx.createOscillator(), bg = ctx.createGain();
    b.type = 'sine'; b.frequency.value = hz(notes[0] - 12);
    bg.gain.setValueAtTime(0, t); bg.gain.linearRampToValueAtTime(0.07, t + 1.5); bg.gain.linearRampToValueAtTime(0, t + dur + 2);
    b.connect(bg).connect(padFilter); b.start(t); b.stop(t + dur + 2.5);
    timers.push(setTimeout(padChord, dur * 1000));
  }

  function sparkle() {
    if (mood !== 'storm') {
      const notes = CHORDS[mood][(chordIdx + 3) % 4];
      const m = notes[Math.floor(Math.random() * notes.length)] + (Math.random() < .5 ? 12 : 24);
      bell(hz(m), 0.05, 2.4, music);
    }
    timers.push(setTimeout(sparkle, 900 + Math.random() * 2200));
  }

  function bell(f, vol = 0.1, len = 1.6, dest = sfx) {
    if (!ctx) return;
    const t = now();
    [1, 2.01, 3.0].forEach((mult, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f * mult;
      const v = vol / (i * 2 + 1);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len / (i + 1));
      o.connect(g).connect(dest); o.start(t); o.stop(t + len + 0.1);
    });
  }

  function useSong(src) {
    // play() вызывается прямо в обработчике клика — иначе iOS не даст играть
    const a = new Audio(src); a.loop = true; a.volume = 0;
    a.play().then(() => {
      song = a; fadeSong(enabled ? 0.8 : 0);
      music.gain.setTargetAtTime(0, now(), 1);
    }).catch(() => {});
  }
  function fadeSong(v) {
    if (!song) return;
    const from = song.volume, t0 = performance.now();
    const step = () => { const k = Math.min(1, (performance.now() - t0) / 1500); song.volume = from + (v - from) * k; if (k < 1) requestAnimationFrame(step); };
    step();
  }

  return {
    start() {
      if (started) return; started = true;
      // iPhone: чтобы звук шёл даже при включённом беззвучном режиме
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
      try { init(); } catch (e) { return; }
      ctx.resume();
      music.gain.setTargetAtTime(0.9, now(), 2);
      padChord(); setTimeout(sparkle, 2500);
      if (window.LOVE && LOVE.music) useSong(LOVE.music);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { ctx.suspend(); song && song.pause(); }
        else { ctx.resume(); song && enabled && song.play().catch(() => {}); }
      });
    },
    toggle() {
      enabled = !enabled;
      if (ctx) master.gain.setTargetAtTime(enabled ? 0.9 : 0, now(), 0.2);
      if (song) { song.muted = !enabled; fadeSong(enabled ? 0.8 : 0); }
      return enabled;
    },
    mood(m) {
      if (!ctx || m === mood) return; mood = m;
      const f = { warm: 1100, night: 800, storm: 420, dawn: 1600 }[m] || 1000;
      padFilter.frequency.setTargetAtTime(f, now(), 1.5);
      if (song) fadeSong(enabled ? (m === 'storm' ? 0.35 : 0.8) : 0);
    },
    rain(v) { ctx && rainGain.gain.setTargetAtTime(v * 0.22, now(), 0.8); },
    engine(v) { ctx && engineGain.gain.setTargetAtTime(v * 0.12, now(), 0.15); },
    chime() { [0, 4, 7, 12].forEach((s, i) => setTimeout(() => bell(hz(76 + s), 0.09, 1.8), i * 90)); },
    pop() { bell(hz(84 + Math.floor(Math.random() * 6)), 0.06, 0.5); },
    clink() { if (!ctx) return; bell(2600, 0.08, 0.6); setTimeout(() => bell(3420, 0.06, 0.5), 30); },
    whoosh() {
      if (!ctx) return;
      const s = ctx.createBufferSource(); s.buffer = noiseBuf(1.2);
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
      const g = ctx.createGain(), t = now();
      f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(3000, t + 0.6);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25, t + 0.25); g.gain.linearRampToValueAtTime(0, t + 1.1);
      s.connect(f).connect(g).connect(sfx); s.start(t);
    },
    thunder() {
      if (!ctx) return;
      const s = ctx.createBufferSource(); s.buffer = noiseBuf(4);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 160;
      const g = ctx.createGain(), t = now();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.9, t + 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + 3.5);
      s.connect(f).connect(g).connect(master); s.start(t);
    },
    heartbeat() {
      if (!ctx) return;
      [0, 0.22].forEach((d, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), t = now() + d;
        o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(i ? 0.35 : 0.5, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        o.connect(g).connect(sfx); o.start(t); o.stop(t + 0.3);
      });
    },
    fanfare() { [0, 4, 7, 11, 12, 16, 19, 24].forEach((s, i) => setTimeout(() => bell(hz(72 + s), 0.1, 2.5), i * 110)); }
  };
})();

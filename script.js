(() => {
  'use strict';
  const doc = document.documentElement;
  doc.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const rnd = (a, b) => a + Math.random() * (b - a);
  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- missing images vanish quietly ---------- */
  document.addEventListener('error', (e) => {
    const i = e.target;
    if (!(i instanceof HTMLImageElement)) return;
    const f = i.closest('figure');
    if (f) f.remove(); else if (i.closest('.shot')) i.remove(); else i.remove();
  }, true);

  /* ---------- scramble text ---------- */
  const GL = '!<>-_\\/[]{}=+*^?#0123456789ABCDEF';
  function scramble(el, text, dur = 700, cb) {
    if (reduce) { el.textContent = text; cb && cb(text); return; }
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      let s = '';
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        s += (c === ' ' || i < p * text.length * 1.15 - 2) ? c : GL[(Math.random() * GL.length) | 0];
      }
      el.textContent = s; cb && cb(s);
      if (p < 1) requestAnimationFrame(step); else { el.textContent = text; cb && cb(text); }
    };
    requestAnimationFrame(step);
  }

  /* ---------- hero: skyline ---------- */
  const wins = [];
  function skyline(svg, W, H, fill, hMin, hMax, wMin, wMax, seed, winDensity, winCol) {
    const r = mulberry(seed); let x = -20; let out = '';
    while (x < W + 20) {
      const w = wMin + r() * (wMax - wMin), h = hMin + r() * (hMax - hMin);
      out += `<rect x="${x.toFixed(0)}" y="${(H - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${fill}"/>`;
      if (r() > .65) out += `<rect x="${(x + w * .4).toFixed(0)}" y="${(H - h - 16).toFixed(0)}" width="2" height="16" fill="${fill}"/>`;
      const cols = Math.floor((w - 8) / 11), rows = Math.floor((h - 12) / 16);
      for (let cy = 0; cy < rows; cy++) for (let cx = 0; cx < cols; cx++) {
        if (r() < winDensity) {
          const c = r() > .8 ? '#9fe0b0' : winCol;
          out += `<rect class="w" x="${(x + 6 + cx * 11).toFixed(0)}" y="${(H - h + 8 + cy * 16).toFixed(0)}" width="5" height="8" fill="${c}" opacity="${(.35 + r() * .5).toFixed(2)}"/>`;
        }
      }
      x += w + (r() * 6);
    }
    svg.innerHTML = out;
    const all = $$('.w', svg), live = $('#' + svg.id + 'f');
    for (let i = 0; i < 14 && all.length; i++) { const w = all.splice((r() * all.length) | 0, 1)[0]; live.appendChild(w); wins.push(w); }
  }
  skyline($('#far'), 1600, 420, '#0a1316', 110, 330, 34, 90, 7, .1, '#e6c27a');
  skyline($('#near'), 1600, 340, '#040606', 70, 250, 50, 120, 21, .06, '#d9a441');
  if (!reduce) setInterval(() => {
    if (document.hidden || heroOff || !wins.length) return;
    for (let i = 0; i < 2; i++) { const w = wins[(Math.random() * wins.length) | 0]; w.setAttribute('opacity', Math.random() > .5 ? (.2 + Math.random() * .6).toFixed(2) : '0.03'); }
  }, 900);

  /* ---------- hero: parallax / eyes / hud ---------- */
  const world = $('#world'), eyes = $('#eyes'), watcher = $('#watcher'), cx = $('#cx'), cy = $('#cy');
  const L = { sky: $('.sky'), far: $('.far'), near: $('.near'), farf: $('#farf'), nearf: $('#nearf'), lamp: $('#lamp'), pool: $('.pool') };
  const P = [[L.sky, -3, .02], [L.far, -8, .06], [L.farf, -8, .06], [L.near, -18, .12], [L.nearf, -18, .12], [L.lamp, -26, 0], [L.pool, -26, 0], [watcher, -30, 0]];
  let pxv = 0, syv = 0, pend = false, wr = null;
  const rect = () => { wr = watcher.getBoundingClientRect(); };
  function applyPar() { pend = false; for (const [el, k, sk] of P) el.style.transform = `translate3d(${(pxv * k).toFixed(1)}px,${(syv * sk).toFixed(1)}px,0)`; }
  const queuePar = () => { if (!pend) { pend = true; requestAnimationFrame(applyPar); } };
  let heroOff = false;
  new IntersectionObserver((es) => { heroOff = !es[0].isIntersecting; $('#hero').classList.toggle('off', heroOff); }, { threshold: 0 }).observe($('#hero'));
  let mx = innerWidth / 2, my = innerHeight / 2, mTick = false;
  addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!mTick) { mTick = true; requestAnimationFrame(() => {
      mTick = false;
      if (scrollY < innerHeight * 1.2) {
        pxv = (mx / innerWidth - .5) * 2; queuePar();
        const r = wr || (rect(), wr);
        const dx = mx - (r.left + r.width * .5), dy = my - (r.top + r.height * .2);
        const d = Math.hypot(dx, dy) || 1;
        eyes.style.transform = `translate(${(dx / d * 1.8).toFixed(2)}px,${(dy / d * 1.2).toFixed(2)}px)`;
        cx.textContent = pad(Math.round(mx), 4); cy.textContent = pad(Math.round(my), 4);
      }
    }); }
  }, { passive: true });

  /* ---------- scroll: progress, sy, timecode, spy ---------- */
  const prog = $('#progress'), tcEl = $('#tc'), logs = $('#logs');
  let sTick = false;
  function onScroll() {
    sTick = false;
    const y = scrollY, max = doc.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (y < innerHeight * 1.2) { syv = y; queuePar(); }
    if (logs) {
      const r = logs.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * .6 - r.top) / r.height));
      logs.style.setProperty('--fill', (p * 100).toFixed(1) + '%');
    }
  }
  addEventListener('scroll', () => { if (!sTick) { sTick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => { wr = null; onScroll(); });
  onScroll();
  const t0 = Date.now();
  setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); tcEl.textContent = `REC ${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; }, 1000);

  const links = $$('.links a[data-s]');
  const spy = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.dataset.s === en.target.id)); }), { rootMargin: '-40% 0px -55% 0px' });
  $$('main > section').forEach((s) => spy.observe(s));

  /* ---------- name decode / glitch / roles ---------- */
  const nameEl = $('#name'), lns = $$('.ln', nameEl);
  lns.forEach((l, i) => { const t = l.dataset.text; setTimeout(() => scramble(l, t, 900), 250 + i * 350); });
  if (!reduce) (function gl() { setTimeout(() => { nameEl.classList.add('gl'); setTimeout(() => nameEl.classList.remove('gl'), 320); gl(); }, rnd(6000, 13000)); })();
  const roles = ['Indie Game Developer', 'C++ Systems Programmer', 'Game Dev Lead @ DevCore', 'OOP Teaching Assistant', 'Raycasting Engine Builder'];
  const roleEl = $('#role');
  if (!reduce) {
    let ri = 0, ci = roles[0].length, del = true;
    (function tick() {
      const w = roles[ri];
      if (del) { ci--; if (ci <= 0) { del = false; ri = (ri + 1) % roles.length; ci = 0; } }
      else { ci++; if (ci >= roles[ri].length) { del = true; roleEl.textContent = roles[ri]; return setTimeout(tick, 1800); } }
      roleEl.textContent = roles[ri].slice(0, ci) || ' ';
      setTimeout(tick, del ? 28 : 55);
    })();
    setTimeout(() => {}, 0);
  }

  /* ---------- reveal ---------- */
  const countUp = (el) => {
    const n = +el.dataset.count; if (reduce) return;
    const t = performance.now();
    const f = (now) => { const p = Math.min(1, (now - t) / 1000); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); };
    el.textContent = '0'; requestAnimationFrame(f);
  };
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target; el.classList.add('in'); io.unobserve(el);
    const h2 = $('h2[data-scramble]', el); if (h2) { const t = h2.textContent; h2.setAttribute('aria-label', t); scramble(h2, t, 650); }
    $$('[data-count]', el).forEach(countUp);
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal],.log').forEach((e) => io.observe(e));

  /* ---------- redactions / tilt ---------- */
  $$('.redacted').forEach((b) => b.addEventListener('click', () => b.classList.toggle('revealed')));
  if (fine && !reduce) $$('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 6 + 'deg'); el.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - .5) * 6) + 'deg'); });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });

  /* ---------- decor: bullet holes + splatters ---------- */
  function hole(seed, paper) {
    const r = mulberry(seed); let s = `<svg viewBox="-100 -100 200 200">`;
    const n = 9 + (r() * 5 | 0);
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.283 + r() * .3; let len = 40 + r() * 55, x = 0, y = 0, d = 'M0 0';
      for (let k = 0; k < 4; k++) { const seg = len / 4, aa = a + (r() - .5) * .5; x += Math.cos(aa) * seg; y += Math.sin(aa) * seg; d += `L${x.toFixed(1)} ${y.toFixed(1)}`;
        if (k === 1 && r() > .5) { const ba = aa + (r() > .5 ? .7 : -.7); d += `M${x.toFixed(1)} ${y.toFixed(1)}L${(x + Math.cos(ba) * 18).toFixed(1)} ${(y + Math.sin(ba) * 18).toFixed(1)}M${x.toFixed(1)} ${y.toFixed(1)}`; } }
      s += `<path d="${d}" stroke="${paper ? '#2a2018' : '#000'}" stroke-width="${(.8 + r()).toFixed(1)}" fill="none" opacity=".75"/>`;
      s += `<path d="${d}" stroke="${paper ? '#fff3' : '#d8d0bd22'}" stroke-width=".6" fill="none" transform="translate(1,1)"/>`;
    }
    s += `<circle r="17" fill="${paper ? '#3a2e22' : '#000'}" opacity=".35"/><circle r="11" fill="#000"/>`;
    s += `<circle r="11" fill="none" stroke="${paper ? '#1b1713' : '#d8d0bd'}" stroke-opacity=".3" stroke-width="2"/></svg>`;
    return s;
  }
  function splat(seed) {
    const r = mulberry(seed); let s = `<svg viewBox="-100 -100 200 200"><g fill="#8e1613">`;
    s += `<circle r="${28 + r() * 10}" opacity=".9"/>`;
    for (let i = 0; i < 10; i++) { const a = r() * 6.283, d = 20 + r() * 25; s += `<circle cx="${(Math.cos(a) * d).toFixed(1)}" cy="${(Math.sin(a) * d).toFixed(1)}" r="${(8 + r() * 14).toFixed(1)}"/>`; }
    for (let i = 0; i < 9; i++) { const a = r() * 6.283, d = 35 + r() * 40, w = 3 + r() * 5;
      s += `<path d="M0 0L${(Math.cos(a - .08) * d).toFixed(1)} ${(Math.sin(a - .08) * d).toFixed(1)}L${(Math.cos(a) * (d + 10)).toFixed(1)} ${(Math.sin(a) * (d + 10)).toFixed(1)}L${(Math.cos(a + .08) * d).toFixed(1)} ${(Math.sin(a + .08) * d).toFixed(1)}Z" opacity=".85"/>`;
      s += `<circle cx="${(Math.cos(a) * (d + 14)).toFixed(1)}" cy="${(Math.sin(a) * (d + 14)).toFixed(1)}" r="${w}"/>`; }
    for (let i = 0; i < 28; i++) { const a = r() * 6.283, d = 48 + r() * 50; s += `<circle cx="${(Math.cos(a) * d).toFixed(1)}" cy="${(Math.sin(a) * d).toFixed(1)}" r="${(1 + r() * 3.2).toFixed(1)}" opacity=".8"/>`; }
    return s + `</g><circle r="22" fill="#b3221d" opacity=".5"/></svg>`;
  }
  $$('.fx[data-fx]').forEach((el) => { const sd = +el.dataset.seed || 1; el.innerHTML = el.dataset.fx === 'hole' ? hole(sd, !!el.dataset.paper) : splat(sd); });

  /* ---------- custom tracking reticle ---------- */
  if (fine) {
    const rt = $('#reticle'), rl = $('#reticle-t'); let lock = null;
    addEventListener('pointermove', (e) => {
      rt.classList.add('on');
      if (!lock) rt.style.transform = `translate(${e.clientX - 17}px,${e.clientY - 17}px)`;
    }, { passive: true });
    document.addEventListener('mouseleave', () => rt.classList.remove('on'));
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest && e.target.closest('a,button,.case,.zoom,input');
      if (!t || t.closest('.file-paper') && false) { if (lock) { lock = null; rt.classList.remove('lock'); rt.style.width = rt.style.height = ''; } return; }
      const b = t.getBoundingClientRect();
      if (b.width > 380 || b.height > 320) return;
      lock = t; rt.classList.add('lock');
      rt.style.transform = `translate(${b.left - 5}px,${b.top - 5}px)`;
      rt.style.width = (b.width + 10) + 'px'; rt.style.height = (b.height + 10) + 'px';
      rl.textContent = t.matches('.tray button') ? 'TRACE' : t.matches('.case') ? 'OPEN FILE' : t.matches('.zoom') ? 'ENLARGE' : (t.dataset.t || 'TARGET');
    });
    document.addEventListener('pointerout', (e) => {
      if (lock && !(e.relatedTarget && lock.contains(e.relatedTarget))) { lock = null; rt.classList.remove('lock'); rt.style.width = rt.style.height = ''; }
    });
  }

  /* ---------- evidence board ---------- */
  let activeTool = null;
  const board = $('#board'), svg = $('#strings'), subj = $('#subj');
  const cards = $$('.case', board);
  const wide = () => matchMedia('(min-width:901px)').matches;
  const pos = new Map();
  cards.forEach((c) => { pos.set(c, { x: +c.dataset.x, y: +c.dataset.y }); c.style.setProperty('--r', c.dataset.r + 'deg'); });
  function place() {
    if (!wide()) { cards.forEach((c) => { c.style.left = c.style.top = ''; }); svg.innerHTML = ''; return; }
    cards.forEach((c) => { const p = pos.get(c); c.style.left = p.x + '%'; c.style.top = p.y + '%'; });
    strings();
  }
  const pinOf = (el) => ({ x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + 8 });
  function curve(a, b, sag) { const mx2 = (a.x + b.x) / 2, my2 = (a.y + b.y) / 2 + sag; return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}Q${mx2.toFixed(1)} ${my2.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`; }
  const shared = [['c1', 'c3', 'RAYCASTING', .9], ['c1', 'c4', 'SPEECH+LLM (PLANNED)', .5]];
  function strings() {
    const W = board.clientWidth, H = board.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const sp = pinOf(subj); sp.y = subj.offsetTop + 8;
    let h = '';
    cards.forEach((c) => { h += `<path class="red" data-c="${c.id}" d="${curve(sp, pinOf(c), 46)}"/>`; });
    shared.forEach(([a, b, label, t]) => {
      const A = pinOf($('#' + a)), B = pinOf($('#' + b));
      h += `<path class="amb" data-a="${a}" data-b="${b}" d="${curve(A, B, 70)}"/>`;
      const mx2 = A.x + (B.x - A.x) * t, my2 = A.y + (B.y - A.y) * t + (t < .6 ? 21 : -6);
      h += `<text data-a="${a}" data-b="${b}" x="${mx2.toFixed(0)}" y="${my2.toFixed(0)}">${label}</text>`;
    });
    svg.innerHTML = h;
    applyTrace();
  }
  /* drag */
  let drag = null, justDragged = false;
  cards.forEach((c) => {
    c.addEventListener('pointerdown', (e) => {
      if (!wide() || e.button > 0) return;
      drag = { c, sx: e.clientX, sy: e.clientY, ox: c.offsetLeft, oy: c.offsetTop, on: false };
      c.setPointerCapture(e.pointerId);
    });
    c.addEventListener('pointermove', (e) => {
      if (!drag || drag.c !== c) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.on && Math.hypot(dx, dy) < 5) return;
      if (!drag.on) { drag.on = true; c.classList.add('drag'); }
      const W = board.clientWidth, H = board.clientHeight;
      const x = Math.max(0, Math.min(W - c.offsetWidth, drag.ox + dx)), y = Math.max(0, Math.min(H - c.offsetHeight, drag.oy + dy));
      pos.set(c, { x: x / W * 100, y: y / H * 100 });
      c.style.left = pos.get(c).x + '%'; c.style.top = pos.get(c).y + '%';
      strings();
    });
    const end = (e) => {
      if (!drag || drag.c !== c) return;
      const was = drag.on; drag = null; c.classList.remove('drag');
      try { c.releasePointerCapture(e.pointerId); } catch (_) {}
      if (was) { justDragged = true; setTimeout(() => justDragged = false, 50); }
    };
    c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
    c.addEventListener('click', () => { if (!justDragged) openFile(c); });
    c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFile(c); } });
  });
  let bq = null, bt = false;
  board.addEventListener('pointermove', (e) => { bq = e; if (!bt) { bt = true; requestAnimationFrame(() => { bt = false; const r = board.getBoundingClientRect(); board.style.setProperty('--mx', (bq.clientX - r.left) + 'px'); board.style.setProperty('--my', (bq.clientY - r.top) + 'px'); }); } });
  addEventListener('resize', place);
  addEventListener('load', place);
  place();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);

  /* trace */
  const out = $('#trace-out');
  function applyTrace() {
    const k = activeTool; document.body.classList.toggle('tracing', !!k);
    cards.forEach((c) => c.classList.toggle('hit', !!k && c.dataset.tools.split(' ').includes(k)));
    $$('.strings path.red').forEach((p) => p.classList.toggle('hit', !!k && $('#' + p.dataset.c).classList.contains('hit')));
    $$('.strings [data-a]').forEach((p) => p.classList.toggle('hit', !!k && $('#' + p.dataset.a).classList.contains('hit') && $('#' + p.dataset.b).classList.contains('hit')));
  }
  function trace(btn) {
    activeTool = btn ? btn.dataset.t : null; applyTrace();
    $$('.tray button').forEach((b) => b.classList.toggle('on', b === btn));
    if (!btn) { out.innerHTML = '&nbsp;'; return; }
    const n = cards.filter((c) => c.classList.contains('hit')).length;
    out.textContent = n ? `> TRACE "${btn.textContent.trim()}": ${n} case file${n > 1 ? 's' : ''} lit on the board` : `> TRACE "${btn.textContent.trim()}": used across projects, not featured in a case file`;
  }
  $$('.tray button').forEach((b) => {
    b.addEventListener('mouseenter', () => { if (fine) trace(b); });
    b.addEventListener('mouseleave', () => { if (fine) trace(null); });
    b.addEventListener('focus', () => trace(b)); b.addEventListener('blur', () => trace(null));
    b.addEventListener('click', () => trace(b.classList.contains('on') && !fine ? null : b));
  });

  /* ---------- case file modal ---------- */
  const modal = $('#file'); let lastFocus = null;
  function openFile(c) {
    lastFocus = document.activeElement;
    $('#file-n').textContent = 'CASE FILE #' + c.dataset.n;
    $('#file-t').textContent = $('h3', c).textContent;
    const shot = $('#file-shot'); shot.innerHTML = '';
    const im = $('.shot img', c); if (im) { const n = im.cloneNode(); n.loading = 'eager'; shot.appendChild(n); }
    $('#file-c').innerHTML = $('.more', c).innerHTML;
    const st = $('#file-s'); st.textContent = $('.stamp', c) ? $('.stamp', c).textContent : '';
    st.hidden = !st.textContent;
    modal.hidden = false; document.body.style.overflow = 'hidden';
    $('.file-x', modal).focus();
  }
  function closeFile() { modal.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeFile(); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!lb.hidden) closeLb(); else if (!modal.hidden) closeFile(); }
    if (e.key === 'Tab' && !modal.hidden) {
      const f = $$('button,a[href]', modal).filter((x) => x.offsetParent !== null); if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  /* ---------- lightbox ---------- */
  const lb = $('#lb'), lbi = $('img', lb);
  const closeLb = () => { lb.hidden = true; if (modal.hidden) document.body.style.overflow = ''; };
  document.addEventListener('click', (e) => {
    const z = e.target.closest('img.zoom');
    if (z) { lbi.src = z.currentSrc || z.src; lbi.alt = z.alt; lb.hidden = false; document.body.style.overflow = 'hidden'; return; }
    if (!lb.hidden) closeLb();
  });
  // modal screenshots also open in lightbox
  modal.addEventListener('click', (e) => { const i = e.target.closest('.exhs img,.file-shot img'); if (i) { e.stopPropagation(); lbi.src = i.currentSrc || i.src; lbi.alt = i.alt; lb.hidden = false; } });

  /* ---------- mini simulations (only while visible) ---------- */
  function whenVisible(el, on, off) { new IntersectionObserver((es) => es.forEach((en) => en.isIntersecting ? on() : off()), { threshold: .1 }).observe(el); }
  // waveform + transcript
  (() => {
    const box = $('.mini-wave'), cv = $('canvas', box), g = cv.getContext('2d'), tx = $('.tx', box);
    let raf = 0, t = 0;
    const draw = () => { t += .06; g.clearRect(0, 0, 300, 110); g.fillStyle = '#8fb89a';
      for (let i = 0; i < 60; i++) { const a = (Math.sin(t + i * .35) * .5 + .5) * (Math.sin(t * .6 + i * .12) * .5 + .5); const h = 4 + a * 40; g.globalAlpha = .4 + a * .6; g.fillRect(i * 5, 86 - h / 2, 3, h); }
      g.globalAlpha = 1; raf = requestAnimationFrame(draw); };
    const lines = ['> mic open, listening', 'STT: "how do I fix a leaking tap"', 'LLM: "close the valve, swap the washer"'];
    let li = 0, ci = 0, timer = 0;
    const type = () => { const l = lines[li]; ci++; const cur = tx.dataset.cur || ''; tx.innerHTML = (tx.dataset.prev || '') + l.slice(0, ci);
      if (ci >= l.length) { tx.dataset.prev = (tx.dataset.prev || '') + l + '<br>'; li++; ci = 0; if (li >= lines.length) { li = 0; setTimeout(() => { tx.dataset.prev = ''; timer = setTimeout(type, 400); }, 1800); return; } timer = setTimeout(type, 500); return; }
      timer = setTimeout(type, 38); };
    if (reduce) { tx.innerHTML = lines.join('<br>'); draw(); cancelAnimationFrame(raf); return; }
    whenVisible(box, () => { cancelAnimationFrame(raf); draw(); clearTimeout(timer); type(); }, () => { cancelAnimationFrame(raf); clearTimeout(timer); });
  })();
  // RSVP
  (() => {
    const box = $('.mini-rsvp');
    const words = 'one word at a time on a fixed focal point so your eyes never have to move'.split(' ');
    let i = 0, tm = 0;
    const root = $('.rs', box);
    const upd = () => { const w = words[i++ % words.length], f = Math.max(0, Math.ceil(w.length / 2) - 1);
      root.innerHTML = `<span class="a">${w.slice(0, f)}</span><span class="f">${w[f]}</span><span>${w.slice(f + 1)}</span>`; };
    root.innerHTML = '<span class="a"></span><span class="f"></span><span></span>';
    upd();
    if (reduce) return;
    whenVisible(box, () => { clearInterval(tm); tm = setInterval(upd, 380); }, () => clearInterval(tm));
  })();
  // SQL
  (() => {
    const box = $('.mini-sql'), pre = $('#sql-o'), dots = $$('.pp i', box);
    const L = ['BEGIN;', 'INSERT INTO orders', '  (user_id, total) ...', 'INSERT INTO order_items', '  (order_id, item) ...', 'UPDATE stock SET qty=qty-1', 'COMMIT;  -- ok'];
    let i = 0, tm = 0;
    const step = () => { if (i >= L.length) { setTimeout(() => { i = 0; pre.textContent = ''; dots.forEach((d) => d.classList.remove('on')); tm = setTimeout(step, 300); }, 1600); return; }
      pre.textContent += (pre.textContent ? '\n' : '') + L[i]; dots.forEach((d, k) => d.classList.toggle('on', k <= Math.floor(i / 2.4))); i++; tm = setTimeout(step, 420); };
    if (reduce) { pre.textContent = L.join('\n'); dots.forEach((d) => d.classList.add('on')); return; }
    whenVisible(box, () => { clearTimeout(tm); i = 0; pre.textContent = ''; step(); }, () => clearTimeout(tm));
  })();

  /* ---------- terminal ---------- */
  const tOut = $('#t-out'), tIn = $('#t-input'), tForm = $('#t-form');
  const hist = []; let hi = 0;
  function say(html, cls) { const p = document.createElement('p'); if (cls) p.className = cls; p.innerHTML = html; tOut.appendChild(p); tOut.scrollTop = tOut.scrollHeight; }
  const caseNames = { 1: 'WATCH-MAN', 2: 'Which Way, Good Sir? / Cartographer', 3: 'Blood Sector', 4: 'Ustad-e-Karigar', 5: 'RSVP Speed Reader', 6: 'Takeaway' };
  const C = {
    help: () => say('commands: about, cases, open &lt;n&gt;, arsenal, contact, email, github, linkedin, whoami, ls, cat readme.txt, watch, clear', 'a'),
    about: () => say('Abduhoo Bin Nasir. CS undergraduate at IST, Islamabad. Game Dev Lead at DevCore. OOP Teaching Assistant Intern. C++ engines, raycasting, offline AI, P2P.'),
    whoami: () => say('subject 042. clearance lvl 4. status: active.'),
    ls: () => say('readme.txt  cases/  evidence/  service.log'),
    cases: () => { Object.entries(caseNames).forEach(([n, t]) => say(`#00${n}  ${t}`)); say('type "open &lt;n&gt;" to pull a file.', 'a'); },
    arsenal: () => say('C++, C, Python, Kotlin, GDScript, PHP, JavaScript, SQL | Godot 4, Raylib, DDA raycasting, P2P, EOS, whisper.cpp, llama.cpp, Piper, Qt | Git, GitHub, MySQL Workbench, Jetpack Compose'),
    contact: () => { say('email: <a href="mailto:abduhoobinnasir@gmail.com">abduhoobinnasir@gmail.com</a>'); say('linkedin: <a href="https://www.linkedin.com/in/abduhoo-bin-nasir-1643693a0/" target="_blank" rel="noopener">abduhoo-bin-nasir</a>'); say('github: <a href="https://github.com/abduhoo-bin-nasir" target="_blank" rel="noopener">abduhoo-bin-nasir</a>'); },
    email: () => { say('opening mail client...', 'a'); location.href = 'mailto:abduhoobinnasir@gmail.com'; },
    github: () => { say('opening GitHub...', 'a'); window.open('https://github.com/abduhoo-bin-nasir', '_blank', 'noopener'); },
    linkedin: () => { say('opening LinkedIn...', 'a'); window.open('https://www.linkedin.com/in/abduhoo-bin-nasir-1643693a0/', '_blank', 'noopener'); },
    watch: () => say('"Case loaded. Don\'t expect me to enjoy it."', 'a'),
    sudo: () => say('nice try. this archive is read-only.', 'e'),
    clear: () => { tOut.innerHTML = ''; },
    exit: () => say('there is no exit. only scroll.', 'e'),
  };
  function run(raw) {
    const cmd = raw.trim(); if (!cmd) return;
    say('&gt; ' + cmd.replace(/</g, '&lt;'), 'u'); hist.push(cmd); hi = hist.length;
    const l = cmd.toLowerCase();
    if (l === 'cat readme.txt') return say('You found the readme. It says: build it from scratch, know how it works, ship it.');
    const m = l.match(/^open\s+#?0*(\d)$/);
    if (m) { const c = $('#c' + m[1]); if (c) { say('pulling file ' + m[1] + '...', 'a'); setTimeout(() => openFile(c), 250); } else say('no such case file.', 'e'); return; }
    if (C[l]) return C[l]();
    say(`command not found: ${l.replace(/</g, '&lt;')}. try "help".`, 'e');
  }
  tForm.addEventListener('submit', (e) => { e.preventDefault(); run(tIn.value); tIn.value = ''; });
  tIn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hi = Math.max(0, hi - 1); tIn.value = hist[hi]; }
    if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hist.length, hi + 1); tIn.value = hist[hi] || ''; }
  });
  $('#quick').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) run(b.dataset.c); });
  say('secure channel open. signal strong.', 'a'); say('type "help" or tap a quick command below.');
  // booted when scrolled in: nothing else needed

  /* ---------- optional ambient audio ---------- */
  const aBtn = $('#audio'), aS = $('#audio-s'); let ac, master, timer;
  function startAudio() {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (!master) {
      master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
      const len = ac.sampleRate * 3, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0); let last = 0;
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
      const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; src.connect(lp); lp.connect(master); src.start();
      const o = ac.createOscillator(), og = ac.createGain(); o.frequency.value = 55; og.gain.value = .02; o.connect(og); og.connect(master); o.start();
    }
    ac.resume(); master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(.5, ac.currentTime + 1.5);
    const thunder = () => { if (!ac || master.gain.value === 0) return; const n = ac.createBufferSource(), b = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate), dd = b.getChannelData(0); let l2 = 0;
      for (let i = 0; i < dd.length; i++) { l2 = (l2 + .03 * (Math.random() * 2 - 1)) / 1.03; dd[i] = l2 * 8 * Math.exp(-i / (ac.sampleRate * .9)); }
      n.buffer = b; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 220; n.connect(f); f.connect(master); n.start(); timer = setTimeout(thunder, rnd(25000, 60000)); };
    clearTimeout(timer); timer = setTimeout(thunder, rnd(9000, 20000));
  }
  function stopAudio() { clearTimeout(timer); if (master && ac) master.gain.linearRampToValueAtTime(0, ac.currentTime + .6); }
  aBtn.addEventListener('click', () => { const on = aBtn.getAttribute('aria-pressed') !== 'true'; aBtn.setAttribute('aria-pressed', on); aS.textContent = on ? 'ON' : 'OFF'; on ? startAudio() : stopAudio(); });

  /* ---------- rain ---------- */
  if (!reduce) {
    const c = $('#rain'), g = c.getContext('2d'); let w, h, drops = [], run = true;
    const size = () => { w = c.width = innerWidth; h = c.height = innerHeight; const n = Math.min(80, Math.round(w * h / 22000)); drops = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, l: 10 + Math.random() * 16, v: 9 + Math.random() * 9 })); };
    size(); addEventListener('resize', size);
    document.addEventListener('visibilitychange', () => { run = !document.hidden; if (run) requestAnimationFrame(f); });
    let last = 0;
    function f(t) {
      if (!run) return;
      if (t - last < 33) { requestAnimationFrame(f); return; }
      last = t;
      g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(216,208,189,.5)'; g.lineWidth = 1; g.beginPath();
      for (const d of drops) { g.moveTo(d.x, d.y); g.lineTo(d.x - d.l * .18, d.y + d.l); d.y += d.v * 1.6; d.x -= d.v * .29; if (d.y > h) { d.y = -d.l; d.x = Math.random() * (w + 60); } }
      g.stroke(); requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
})();

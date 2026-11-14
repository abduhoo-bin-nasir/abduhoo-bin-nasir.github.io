(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rainInit() {
    const c = document.createElement('canvas'); c.id = 'rain'; c.setAttribute('aria-hidden', 'true'); document.body.prepend(c);
    const g = c.getContext('2d'); let w, h, drops = [], run = true;
    const size = () => { w = c.width = innerWidth; h = c.height = innerHeight; const n = Math.min(140, Math.round(w * h / 16000)); drops = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, l: 10 + Math.random() * 18, v: 9 + Math.random() * 9 })); };
    size(); addEventListener('resize', size);
    document.addEventListener('visibilitychange', () => { run = !document.hidden; if (run) requestAnimationFrame(f); });
    function f() {
      if (!run) return;
      g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(216,208,189,.55)'; g.lineWidth = 1; g.beginPath();
      for (const d of drops) { g.moveTo(d.x, d.y); g.lineTo(d.x - d.l * .18, d.y + d.l); d.y += d.v; d.x -= d.v * .18; if (d.y > h) { d.y = -d.l; d.x = Math.random() * (w + 60); } }
      g.stroke(); requestAnimationFrame(f);
    }
    f();
  }
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- live timecode ---------- */
  const tc = $('#live-timecode');
  const tick = () => {
    const d = new Date();
    tc.textContent = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  tick(); setInterval(tick, 1000);

  /* ---------- redactions: click / Enter / Space (buttons) ---------- */
  $$('.redacted').forEach((el) => el.addEventListener('click', () => el.classList.toggle('revealed')));

  /* ---------- images: missing ones quietly disappear ---------- */
  function refreshLocker() {
    const sec = $('#evidence-locker'), nav = $('#nav-evidence');
    const ok = $$('img', sec).some((i) => i.complete && i.naturalWidth > 0);
    sec.hidden = !ok; nav.hidden = !ok;
  }
  function tidy() {
    $$('.thumbs').forEach((t) => { if (!t.querySelector('figure')) t.remove(); else t.classList.toggle('two', t.querySelectorAll('figure').length > 1 && t.closest('.folder:not(.wide)') !== null); });
    $$('.case-media').forEach((m) => { if (!m.querySelector('figure')) { m.closest('.feature').style.gridTemplateColumns = '1fr'; m.remove(); } });
    refreshLocker();
  }
  function imgFail(img) {
    const fb = (img.dataset.fallback || '').split('|').filter(Boolean);
    if (fb.length) { img.dataset.fallback = fb.slice(1).join('|'); img.src = fb[0]; return; }
    if (img.hasAttribute('data-keep')) return;
    (img.closest('figure') || img.closest('[data-slot]') || img).remove();
    tidy();
  }
  document.addEventListener('error', (e) => { if (e.target instanceof HTMLImageElement) imgFail(e.target); }, true);
  document.addEventListener('load', (e) => { if (e.target instanceof HTMLImageElement) refreshLocker(); }, true);
  $$('img[src]').forEach((i) => { if (i.complete && i.naturalWidth === 0) imgFail(i); });
  addEventListener('load', tidy);
  tidy();

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox'), lbImg = $('img', lb);
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ''; };
  document.addEventListener('click', (e) => {
    const z = e.target.closest && e.target.closest('img.zoomable');
    if (z) { lbImg.src = z.currentSrc || z.src; lbImg.alt = z.alt; lb.hidden = false; document.body.style.overflow = 'hidden'; return; }
    if (!lb.hidden) closeLb();
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  /* ---------- trace: tool -> case files ---------- */
  const out = $('#trace-out'), cases = $$('.case[data-tools]'), gear = $('.gear');
  const label = (b) => b.textContent.trim();
  function trace(btn) {
    const k = btn.dataset.t;
    let n = 0;
    cases.forEach((c) => { const hit = c.dataset.tools.split(' ').includes(k); c.classList.toggle('hit', hit); if (hit) n++; });
    $$('button', gear).forEach((b) => b.classList.toggle('on', b === btn));
    document.body.classList.add('tracing');
    out.textContent = n
      ? `> TRACE "${label(btn)}": ${n} case file${n > 1 ? 's' : ''} lit below`
      : `> TRACE "${label(btn)}": used across projects, not featured in a case file`;
  }
  function clearTrace() {
    document.body.classList.remove('tracing');
    cases.forEach((c) => c.classList.remove('hit'));
    $$('button', gear).forEach((b) => b.classList.remove('on'));
    out.innerHTML = '&nbsp;';
  }
  $$('button[data-t]', gear).forEach((b) => {
    b.addEventListener('mouseenter', () => trace(b));
    b.addEventListener('focus', () => trace(b));
    b.addEventListener('click', () => trace(b));
    b.addEventListener('mouseleave', clearTrace);
    b.addEventListener('blur', clearTrace);
  });

  /* ---------- scroll spy ---------- */
  const links = $$('.links a[data-s]');
  const spy = new IntersectionObserver((es) => {
    es.forEach((en) => { if (en.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.dataset.s === en.target.id)); });
  }, { rootMargin: '-35% 0px -60% 0px' });
  $$('main > section').forEach((s) => spy.observe(s));

  /* ---------- reveal on scroll ---------- */
  const targets = $$('.sec-h, .paper, .tray, .case, .log, .term, .polaroid');
  if (reduce || !('IntersectionObserver' in window)) { /* leave visible */ }
  else {
    targets.forEach((t) => t.classList.add('rv'));
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .08, rootMargin: '0px 0px -6% 0px' });
    targets.forEach((t) => io.observe(t));
  }

  if (reduce) return;

  /* ---------- film grain ---------- */
  const gc = $('#grain'), gg = gc.getContext('2d');
  gc.width = 200; gc.height = 200;
  const gi = gg.createImageData(200, 200);
  setInterval(() => {
    if (document.hidden) return;
    for (let i = 0; i < gi.data.length; i += 4) { const v = Math.random() * 255; gi.data[i] = gi.data[i + 1] = gi.data[i + 2] = v; gi.data[i + 3] = 255; }
    gg.putImageData(gi, 0, 0);
  }, 160);

  /* ---------- rain ---------- */
  rainInit();

  /* ---------- glitch the name, and drop a random feed ---------- */
  const name = $('#name');
  (function glitch() {
    setTimeout(() => {
      name.classList.add('glitch');
      setTimeout(() => name.classList.remove('glitch'), 350);
      glitch();
    }, 9000 + Math.random() * 9000);
  })();
})();

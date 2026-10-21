(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const $ = (s) => document.querySelector(s);

  /* ---- flashlight: follows the cursor, wanders on its own on touch screens ---- */
  let tx = innerWidth / 2, ty = innerHeight * 0.3, x = tx, y = ty, idle = 0;
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; idle = 0; });
  (function loop(t) {
    idle++;
    if (idle > 180 || matchMedia('(hover: none)').matches) {
      tx = innerWidth / 2 + Math.sin(t / 1900) * innerWidth * 0.3;
      ty = innerHeight / 2 + Math.cos(t / 2300) * innerHeight * 0.3;
    }
    x += (tx - x) * 0.14; y += (ty - y) * 0.14;
    root.style.setProperty('--mx', x + 'px');
    root.style.setProperty('--my', y + 'px');
    requestAnimationFrame(loop);
  })(0);

  /* ---- live timecode, counting from page load ---- */
  const clock = $('#clock'), start = Date.now();
  const pad = (n) => String(n).padStart(2, '0');
  setInterval(() => {
    const s = Math.floor((Date.now() - start) / 1000);
    clock.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  }, 1000);

  /* ---- redactions: tap to reveal on touch/keyboard ---- */
  document.querySelectorAll('.redact').forEach((el) => {
    el.tabIndex = 0;
    el.addEventListener('click', () => el.classList.toggle('open'));
  });

  if (reduce) return;

  /* ---- film grain ---- */
  const c = $('#grain'), g = c.getContext('2d');
  c.width = 220; c.height = 220;
  const img = g.createImageData(220, 220);
  setInterval(() => {
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }, 70);

  /* ---- random glitch on the name, and an occasional light flicker ---- */
  const name = $('#name');
  (function glitch() {
    setTimeout(() => {
      name.classList.add('glitch');
      setTimeout(() => name.classList.remove('glitch'), 350);
      glitch();
    }, 4000 + Math.random() * 7000);
  })();
  (function flicker() {
    setTimeout(() => {
      document.body.classList.add('flicker');
      setTimeout(() => document.body.classList.remove('flicker'), 90 + Math.random() * 120);
      flicker();
    }, 7000 + Math.random() * 9000);
  })();

  /* ---- boot sequence: plays once per tab, click or key skips it ---- */
  const boot = $('#boot'), log = $('#boot-log');
  if (sessionStorage.getItem('booted')) { boot.remove(); return; }
  const lines = [
    '> ARCHIVE TERMINAL v1.0',
    '> mounting /subjects/abduhoo_bin_nasir ... ok',
    '> loading case files: 4',
    '> camera 01 ........ online',
    '> something is already watching',
    '> playback.',
  ];
  let li = 0, ci = 0, timer;
  const finish = () => {
    clearTimeout(timer);
    boot.classList.add('done');
    sessionStorage.setItem('booted', '1');
    setTimeout(() => boot.remove(), 900);
  };
  (function type() {
    if (li >= lines.length) return void (timer = setTimeout(finish, 500));
    log.textContent += lines[li][ci++] ?? '';
    if (ci >= lines[li].length) { log.textContent += '\n'; li++; ci = 0; timer = setTimeout(type, 260); }
    else timer = setTimeout(type, 22);
  })();
  boot.addEventListener('click', finish);
  addEventListener('keydown', finish, { once: true });
})();

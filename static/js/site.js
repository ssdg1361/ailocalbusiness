// AI Local Business — the small amount of script the pages need.
// Every hidden starting state in the CSS sits under html.js and prefers-reduced-motion: no-preference,
// so the pages read completely without this file.

// Phone menu
(() => {
  const top = document.querySelector('.site-top'), btn = top && top.querySelector('.menu-btn');
  if (!btn) return;
  btn.addEventListener('click', () => { const open = top.classList.toggle('open'); btn.setAttribute('aria-expanded', open); });
})();

// Homepage: the town finder. The same six searches, rewritten for the town you pick.
(() => {
  const list = document.getElementById('bands');
  if (!list) return;
  const trades = [
    ['Plumber', 'emergency plumber {t} NJ', 'Who is the best emergency plumber in {t}, NJ?', 'Searched with water on the floor. Few people scroll past the map.'],
    ['Heating &amp; cooling', 'AC repair {t} NJ', 'Who should I call for AC repair in {t}, NJ?', 'Half the town searches it on the same hot afternoon.'],
    ['Electrician', 'electrician near {t} NJ', 'Can you recommend an electrician near {t}, NJ?', 'Panel upgrades, EV chargers, generator hookups.'],
    ['Dryer vents', 'dryer vent cleaning {t} NJ', 'Who does dryer vent cleaning in {t}, NJ?', 'Vent Viper&rsquo;s trade, out of Wyckoff.'],
    ['Landscaping', 'landscaper {t} NJ', 'Who is a good landscaper in {t}, NJ?', 'Spring cleanups get booked weeks ahead.'],
    ['Water damage', 'water damage restoration {t} NJ', 'Who should I call for water damage restoration in {t}, NJ?', 'Now asked of ChatGPT by name: who should I call?'],
  ];
  const tabs = [...document.querySelectorAll('.tab')], enc = encodeURIComponent;
  function show(tab, focus) {
    const t = tab.dataset.town;
    tabs.forEach((b) => { const on = b === tab; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
    list.setAttribute('aria-labelledby', tab.id);
    list.innerHTML = trades.map(([name, q, ask, note], i) => {
      const query = q.replace('{t}', t), question = ask.replace('{t}', t);
      return `<li class="band" style="--i:${i}"><span class="trade">${name}</span><span><span class="q">${query}</span><span class="note">${note}</span></span><span class="go"><a class="tl" target="_blank" rel="noopener" href="https://www.google.com/search?q=${enc(query)}">Google it</a><a class="tl" target="_blank" rel="noopener" href="https://chatgpt.com/?q=${enc(question)}">Ask ChatGPT</a></span></li>`;
    }).join('');
    list.classList.remove('swap'); void list.offsetWidth; list.classList.add('swap');
    if (focus) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => show(tab));
    tab.addEventListener('keydown', (e) => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); show(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
})();

// Homepage: client work filters
(() => {
  const btns = [...document.querySelectorAll('.filters button')], projs = [...document.querySelectorAll('.proj')];
  btns.forEach((b) => b.addEventListener('click', () => {
    btns.forEach((x) => x.setAttribute('aria-pressed', x === b));
    projs.forEach((p) => { p.hidden = !(b.dataset.f === 'all' || p.dataset.region === b.dataset.f); });
  }));
})();

// Reveal once on entering the viewport; never leaves content hidden.
// Inner pages mark their parts here, so the markup stays plain.
(() => {
  document.querySelectorAll('.prose > h2, .post-list li, .aside > *, .check-what > div, .faq details').forEach((el, i, all) => {
    if (!el.hasAttribute('data-reveal')) { el.setAttribute('data-reveal', ''); el.style.setProperty('--i', String(i % 4)); }
  });
  const targets = document.querySelectorAll('[data-reveal], .flow');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  targets.forEach((el) => io.observe(el));
  addEventListener('load', () => setTimeout(() => targets.forEach((el) => {
    const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
  }), 2500));
})();

// Play the clip only while it is in view, and never under reduced motion
(() => {
  const clips = [...document.querySelectorAll('video[autoplay]')];
  if (!clips.length) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)'), inView = new Set();
  const sync = (v) => { if (calm.matches) return; if (inView.has(v)) v.play().catch(() => {}); else v.pause(); };
  const settle = () => { for (const v of clips) { if (calm.matches) { v.removeAttribute('autoplay'); v.pause(); v.load(); } else if (inView.has(v)) v.play().catch(() => {}); } };
  const io = new IntersectionObserver((es) => { for (const e of es) { if (e.isIntersecting) inView.add(e.target); else inView.delete(e.target); sync(e.target); } }, { threshold: 0.2 });
  clips.forEach((v) => io.observe(v)); settle(); calm.addEventListener('change', settle);
})();

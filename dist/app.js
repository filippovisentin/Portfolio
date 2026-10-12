/* Filippo Antonio Visentin — portfolio. Vanilla JS, no dependencies. */
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const main = $('main'), reduced = matchMedia('(prefers-reduced-motion: reduce)'), fine = matchMedia('(hover: hover) and (pointer: fine)');
let lang = (navigator.language || 'it').toLowerCase().startsWith('it') ? 'it' : 'en'; try { lang = localStorage.getItem('portfolio-language') || lang } catch {} if (!['it', 'en'].includes(lang)) lang = 'it';
const t = (it, en) => lang === 'it' ? it : en, v = x => x && typeof x === 'object' ? x[lang] : (x || '');
const num = n => String(n).padStart(2, '0'), N = projects.length;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k;
const dims = window.IMAGE_DIMS || {};
const src = (n, s = '') => `assets/${n}${s}.webp`;
const at = (d, side) => d[0] >= d[1] ? Math.min(side, d[0]) : Math.round(Math.min(side, d[1]) * d[0] / d[1]);
function pic(name, alt, { sizes = '100vw', eager = false, cls = '', vt = '', high = false, low = false } = {}) {
  const d = dims[name] || [1600, 1000], seen = new Set();
  const set = [['-s', at(d, 720)], ['-m', at(d, 1600)], ['', d[0]]].filter(([, w]) => !seen.has(w) && seen.add(w)).map(([s, w]) => `${src(name, s)} ${w}w`).join(', ');
  return `<img${cls ? ` class="${cls}"` : ''} src="${src(name, '-m')}" srcset="${set}" sizes="${sizes}" width="${d[0]}" height="${d[1]}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}"${vt === 'hero' || high ? ' fetchpriority="high"' : low ? ' fetchpriority="low"' : ''} decoding="async" draggable="false"${vt ? ` style="view-transition-name:${vt}"` : ''}>`;
}
const letters = (s, cls = 'ch') => [...s].map((c, i) => c === ' ' ? '<span class="sp"> </span>' : `<span class="${cls}" style="--i:${i}">${esc(c)}</span>`).join('');
const words = s => s.split(/(\s+|<br>)/).map((w, i) => w === '<br>' ? '<br>' : /^\s+$/.test(w) ? ' ' : `<span class="w"><span style="--i:${i}">${w}</span></span>`).join('');
const disciplines = { all: P('Tutti', 'All'), exhibition: P('Exhibition', 'Exhibition'), architecture: P('Architettura', 'Architecture'), product: P('Product & service', 'Product & service') };
const ext = (href, label, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${href}" target="_blank" rel="noopener noreferrer">${label}<span class="sr-only"> (${t('si apre in una nuova scheda', 'opens in a new tab')})</span></a>`;
const footer = () => `<footer class="site-footer"><span>© ${new Date().getFullYear()} Filippo Antonio Visentin</span><span class="foot-links"><a href="mailto:${profile.email}">${profile.email}</a>${ext(profile.linkedin, 'LinkedIn ↗')}${ext(profile.github, 'GitHub ↗')}${ext(profile.docs[0].href, 'CV ↓')}</span><button class="to-top" type="button">${t('Torna su', 'Back to top')} ↑</button></footer>`;
let cleanup = () => {};
const onCleanup = fn => { const prev = cleanup; cleanup = () => { prev(); fn() } };
const listen = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); onCleanup(() => el.removeEventListener(ev, fn, opt)) };

/* ---------- Cursor ---------- */
const cursor = $('.cursor'), cursorLabel = $('.cursor span');
let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy, craf = 0;
function cursorTick() { cx = lerp(cx, tx, .2); cy = lerp(cy, ty, .2); cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`; craf = Math.abs(cx - tx) + Math.abs(cy - ty) > .1 ? requestAnimationFrame(cursorTick) : 0 }
if (fine.matches) {
  document.documentElement.classList.add('has-cursor');
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; if (reduced.matches) { cx = tx; cy = ty; cursor.style.transform = `translate3d(${cx}px,${cy}px,0)` } else if (!craf) craf = requestAnimationFrame(cursorTick); cursor.classList.add('on') }, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.remove('on'));
  document.addEventListener('pointerover', e => { const el = e.target.closest('[data-cursor]'); cursor.classList.toggle('big', !!el); cursorLabel.textContent = el ? v(JSON.parse(el.dataset.cursor)) : ''; cursor.classList.toggle('link', !el && !!e.target.closest('a,button,summary,select,label,input')) });
  addEventListener('pointerdown', () => cursor.classList.add('press')); addEventListener('pointerup', () => cursor.classList.remove('press'));
}
const C = (it, en) => esc(JSON.stringify(P(it, en)));

/* ---------- Magnetic buttons ---------- */
function magnetic(root) {
  if (!fine.matches || reduced.matches) return;
  $$('.magnetic', root).forEach(el => {
    const move = e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .3}px,${(e.clientY - r.top - r.height / 2) * .3}px)` };
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', () => el.style.transform = '');
  });
}

/* ---------- Reveal on scroll ---------- */
let io;
function reveal(root) {
  io?.disconnect();
  const els = $$('.rv', root);
  if (reduced.matches || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return }
  io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -12% 0px' });
  els.forEach(e => io.observe(e));
}

/* ---------- Clock ---------- */
const clock = $('.clock');
function tickClock() { try { clock.textContent = 'MILANO ' + new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' }).format(new Date()) } catch { clock.textContent = '' } }
tickClock(); setInterval(tickClock, 30000);

/* ---------- Scroll progress ---------- */
const bar = $('.progress');
let sraf = 0, lastY = 0; const scrollFns = new Set(), header = $('.site-header');
addEventListener('scroll', () => { if (!sraf) sraf = requestAnimationFrame(() => {
  sraf = 0; const h = document.documentElement.scrollHeight - innerHeight, y = scrollY;
  bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  if (y > lastY + 6 && y > 160 && !header.contains(document.activeElement)) header.classList.add('hide'); else if (y < lastY - 6 || y < 160) header.classList.remove('hide');
  lastY = y; scrollFns.forEach(f => f()) }) }, { passive: true });
const onScroll = fn => { scrollFns.add(fn); onCleanup(() => scrollFns.delete(fn)); fn() };

/* =========================================================
   HOME — 3D ring of projects
   ========================================================= */
function home() {
  const sel = Math.max(0, projects.findIndex(p => p.id === sessionStorage.getItem('fav-active')));
  main.innerHTML = `<section class="home">
  <h1 class="sr-only">Filippo Antonio Visentin — ${t('Progetti selezionati', 'Selected works')}</h1>
  <div class="bigname" aria-hidden="true"></div>
  <p class="home-claim rv">${words(t('Osservo come viviamo.<br>Progetto ciò che ci<br>mette in relazione.', 'I observe how we live.<br>I design what brings<br>us together.'))}</p>
  <div class="home-meta"><span>${t('Archivio aperto', 'Open archive')} — ${num(N)} ${t('progetti', 'projects')}</span><span>${t('Product & interior design · Politecnico di Milano', 'Product & interior design · Politecnico di Milano')}</span></div>
  <div class="ring-stage" role="region" aria-roledescription="carousel" aria-label="${t('Galleria tridimensionale dei progetti', 'Three-dimensional project gallery')}" data-cursor="${C('Trascina', 'Drag')}">
    <div class="ring-world"><div class="ring">${projects.map((p, i) => `<a class="card" href="#${p.id}" data-i="${i}" draggable="false"><span class="card-media">${pic(p.cover.name, '', { sizes: '(max-width:700px) 64vw, min(31vw, 420px)', eager: true, high: i === sel, low: i !== sel })}</span><span class="card-label"><span>${num(i + 1)}</span><span>${p.name}</span></span></a>`).join('')}</div></div>
  </div>
  <div class="home-bottom">
    <div class="hint"><span class="hint-icon" aria-hidden="true"></span>${t('Trascina, scorri o usa le frecce', 'Drag, scroll or use the arrow keys')}<br><a href="#index">${t('Oppure vedi l’indice', 'Or view the index')} ↗</a></div>
    <a class="now magnetic" href="#" aria-live="polite"><span class="now-type"></span><span class="now-name"></span><span class="now-open" aria-hidden="true">↗</span></a>
    <div class="ring-nav"><button class="prev" type="button" aria-label="${t('Progetto precedente', 'Previous project')}">←</button><div class="dots">${projects.map((p, i) => `<button type="button" data-go="${i}" aria-label="${p.name}"></button>`).join('')}</div><button class="next" type="button" aria-label="${t('Progetto successivo', 'Next project')}">→</button><span class="count"></span></div>
  </div></section>`;
  const stage = $('.ring-stage'), world = $('.ring-world'), ring = $('.ring'), cards = $$('.card'), big = $('.bigname'), now = $('.now');
  const step = 360 / N;
  let angle = sel * step, target = angle, active = -1, raf = 0, R = 400, tiltX = 0, tiltY = 0, ttX = 0, ttY = 0;
  function layout() { const w = cards[0].offsetWidth; R = Math.round((w / 2) / Math.tan(Math.PI / N) * 1.18); ring.style.setProperty('--r', R + 'px'); draw() }
  function draw() {
    world.style.transform = `translateZ(${-R}px) rotateX(${-4 + tiltY}deg) rotateY(${tiltX}deg)`;
    cards.forEach((c, i) => {
      let rel = ((i * step - angle) % 360 + 540) % 360 - 180, a = Math.abs(rel);
      c.style.transform = `rotateY(${i * step - angle}deg) translateZ(${R}px)`;
      c.style.opacity = String(clamp((118 - a) / 34, 0, 1));
      c.style.setProperty('--g', String(clamp(a / (step * .7), 0, 1)));
      c.style.pointerEvents = a > 100 ? 'none' : 'auto';
      c.tabIndex = a < step / 2 ? 0 : -1;
    });
    const i = ((Math.round(angle / step) % N) + N) % N;
    if (i !== active) setActive(i);
  }
  function setActive(i) {
    active = i; const p = projects[i];
    sessionStorage.setItem('fav-active', p.id);
    big.innerHTML = `<span class="bn">${letters(p.name)}</span>`;
    now.href = '#' + p.id; $('.now-type', now).textContent = `${num(i + 1)} — ${v(p.type)}${p.year ? ' · ' + p.year : ''}`; $('.now-name', now).textContent = p.name;
    $('.count').textContent = `${num(i + 1)} / ${num(N)}`;
    $$('.dots button').forEach((b, j) => b.setAttribute('aria-current', String(j === i)));
    cards.forEach((c, j) => c.classList.toggle('is-front', j === i));
  }
  function loop() {
    angle = reduced.matches ? target : lerp(angle, target, .085);
    tiltX = lerp(tiltX, ttX, .06); tiltY = lerp(tiltY, ttY, .06);
    draw();
    raf = Math.abs(target - angle) > .02 || Math.abs(tiltX - ttX) + Math.abs(tiltY - ttY) > .01 ? requestAnimationFrame(loop) : 0;
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop) };
  const snap = () => { target = Math.round(target / step) * step; kick() };
  const goTo = i => { const cur = Math.round(target / step); let d = ((i - cur) % N + N) % N; if (d > N / 2) d -= N; target = (cur + d) * step; kick() };
  $('.prev').onclick = () => { target = (Math.round(target / step) - 1) * step; kick() };
  $('.next').onclick = () => { target = (Math.round(target / step) + 1) * step; kick() };
  $$('.dots button').forEach(b => b.onclick = () => goTo(+b.dataset.go));
  // drag with inertia
  let drag = null;
  listen(stage, 'pointerdown', e => { if (e.button) return; drag = { x: e.clientX, y: e.clientY, a: target, moved: false, vx: 0, lx: e.clientX, lt: performance.now() } });
  listen(window, 'pointermove', e => {
    if (!drag) { if (fine.matches && !reduced.matches) { ttX = (e.clientX / innerWidth - .5) * 10; ttY = (e.clientY / innerHeight - .5) * -6; kick() } return }
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < 6) return;
    if (!drag.moved && e.pointerType === 'touch' && Math.abs(e.clientY - drag.y) > Math.abs(dx)) { drag = null; return }
    drag.moved = true; stage.classList.add('dragging');
    const now = performance.now(), dt = Math.max(1, now - drag.lt); drag.vx = lerp(drag.vx, (e.clientX - drag.lx) / dt, .4); drag.lx = e.clientX; drag.lt = now;
    target = drag.a - dx * (innerWidth < 700 ? .32 : .2); kick();
  });
  const up = () => { if (!drag) return; stage.classList.remove('dragging'); if (drag.moved) { target -= drag.vx * 140 * (innerWidth < 700 ? .32 : .2); snap(); stage.dataset.justDragged = '1'; setTimeout(() => delete stage.dataset.justDragged, 60) } drag = null };
  listen(window, 'pointerup', up); listen(window, 'pointercancel', up);
  cards.forEach((c, i) => c.addEventListener('click', e => {
    if (stage.dataset.justDragged) { e.preventDefault(); return }
    if (i !== active) { e.preventDefault(); goTo(i); return }
    $('img', c).style.viewTransitionName = 'hero';
  }));
  now.addEventListener('click', () => { const im = $('img', cards[active]); if (im) im.style.viewTransitionName = 'hero' });
  // wheel
  let wt = 0;
  listen(stage.closest('.home'), 'wheel', e => { e.preventDefault(); target += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * .09; kick(); clearTimeout(wt); wt = setTimeout(snap, 140) }, { passive: false });
  listen(window, 'keydown', e => { if (e.target.closest('input,select,textarea')) return; if (e.key === 'ArrowRight') { e.preventDefault(); $('.next').click() } if (e.key === 'ArrowLeft') { e.preventDefault(); $('.prev').click() } });
  listen(window, 'resize', layout);
  onCleanup(() => cancelAnimationFrame(raf));
  layout(); magnetic(main);
}

/* =========================================================
   INDEX — list with floating preview
   ========================================================= */
function index() {
  let filter = sessionStorage.getItem('fav-filter') || 'all';
  main.innerHTML = `<section class="page index-page">
  <div class="page-head"><span>${t('Lavori selezionati', 'Selected works')} — ${num(N)}</span><a href="#home">${t('Vista spaziale', 'Spatial view')} ↗</a></div>
  <h1 class="display rv">${words(t('Forme di<br>relazione.', 'Forms of<br>connection.'))}</h1>
  <div class="filters" role="group" aria-label="${t('Filtra per disciplina', 'Filter by discipline')}">${Object.keys(disciplines).map(k => `<button type="button" data-f="${k}" aria-pressed="${k === filter}">${v(disciplines[k])}<sup>${k === 'all' ? N : projects.filter(p => p.discipline === k).length}</sup></button>`).join('')}</div>
  <ol class="rows">${projects.map((p, i) => `<li class="row-item" data-d="${p.discipline}"><a class="row" href="#${p.id}" data-i="${i}" data-cursor="${C('Apri', 'Open')}"><span class="row-num">${p.featured ? '●' : num(i + 1)}</span><span class="row-thumb">${pic(p.cover.name, '', { sizes: '96px' })}</span><span class="row-name">${p.name}</span><span class="row-type">${v(p.type)}</span><span class="row-year">${p.year || '—'}</span><span class="row-arrow" aria-hidden="true">↗</span></a></li>`).join('')}</ol>
  <a class="code-cta" href="#code" data-cursor="${C('Apri', 'Open')}"><span class="tag">${t('Codice', 'Code')} — GitHub</span><span class="code-cta-name">FORMA</span><span class="code-cta-sub">${v(forma.subtitle)}</span><span class="row-arrow" aria-hidden="true">↗</span></a>
  ${footer()}</section>
  <div class="preview" aria-hidden="true">${projects.map((p, i) => `<div class="pv" data-i="${i}">${pic(p.cover.name, '', { sizes: '30vw' })}</div>`).join('')}</div>`;
  const apply = () => { $$('.filters button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === filter))); $$('.row-item').forEach((r, i) => { const on = filter === 'all' || r.dataset.d === filter; r.hidden = !on }); sessionStorage.setItem('fav-filter', filter) };
  $$('.filters button').forEach(b => b.onclick = () => { filter = b.dataset.f; apply() });
  apply();
  const pv = $('.preview'), pvs = $$('.pv');
  let px = 0, py = 0, qx = 0, qy = 0, raf = 0, shown = -1;
  const tick = () => { qx = lerp(qx, px, .14); qy = lerp(qy, py, .14); const rot = clamp((px - qx) * .04, -8, 8); pv.style.transform = `translate3d(${qx}px,${qy}px,0) rotate(${rot}deg)`; raf = Math.abs(qx - px) + Math.abs(qy - py) > .2 ? requestAnimationFrame(tick) : 0 };
  if (fine.matches) {
    $$('.row').forEach(r => {
      r.addEventListener('pointerenter', () => { shown = +r.dataset.i; pvs.forEach((x, i) => x.classList.toggle('on', i === shown)); pv.classList.add('on') });
      r.addEventListener('pointerleave', () => pv.classList.remove('on'));
      r.addEventListener('click', () => { const im = $(`.pv[data-i="${r.dataset.i}"] img`); if (im && pv.classList.contains('on')) im.style.viewTransitionName = 'hero'; else $('.row-thumb img', r).style.viewTransitionName = 'hero' });
    });
    listen(window, 'pointermove', e => { px = e.clientX; py = e.clientY; if (reduced.matches) { qx = px; qy = py; pv.style.transform = `translate3d(${qx}px,${qy}px,0)` } else if (!raf) raf = requestAnimationFrame(tick) });
  } else $$('.row').forEach(r => r.addEventListener('click', () => $('.row-thumb img', r).style.viewTransitionName = 'hero'));
  onCleanup(() => cancelAnimationFrame(raf));
}

/* =========================================================
   PROJECT
   ========================================================= */
let light = { list: [], i: 0 };
function project(p) {
  const i = projects.indexOf(p), next = projects[(i + 1) % N], rel = p.related && projects.find(x => x.id === p.related);
  const story = [p.cover, ...p.chapters.map(c => c.image), ...p.gallery];
  const pinned = p.gallery.length >= 3;
  main.innerHTML = `<article class="project${p.dark ? ' is-dark' : ''}">
  <header class="p-hero">
    <button class="p-hero-media" type="button" data-light="story:0" aria-label="${t('Ingrandisci immagine', 'Enlarge image')}" data-cursor="${C('Ingrandisci', 'Enlarge')}">${pic(p.cover.name, v(p.cover.cap), { eager: true, vt: 'hero' })}</button>
    <div class="p-hero-top"><a href="#index" class="back">← ${t('Tutti i progetti', 'All projects')}</a><span>${num(i + 1)} / ${num(N)}</span></div>
    <h1 class="p-title" aria-label="${esc(p.name)}"><span aria-hidden="true">${letters(p.name)}</span></h1>
    <div class="p-hero-bottom"><span>${v(p.type)}${p.year ? ' — ' + p.year : ''}</span><span class="p-sub">${v(p.subtitle)}</span><span class="scroll-cue" aria-hidden="true">${t('Scorri', 'Scroll')}</span></div>
  </header>
  <section class="p-intro">
    <p class="p-question rv">${words(v(p.question))}</p>
    <div class="p-intro-grid">
      <dl class="p-meta rv">${p.meta.map(([k, x]) => `<div><dt>${v(k)}</dt><dd>${v(x)}</dd></div>`).join('')}<div><dt>${t('Progetto di', 'Designed by')}</dt><dd>${p.team}</dd></div></dl>
      <div class="p-text rv"><p class="lead">${v(p.intro)}</p><p>${v(p.text)}</p>${rel ? `<a class="related magnetic" href="#${rel.id}">↗ ${rel.name}</a>` : ''}</div>
    </div>
  </section>
  <section class="p-story" id="story">
    <div class="section-label"><span>01 / ${t('Dentro il progetto', 'Inside the project')}</span><span>${t('Idea → spazio → dettaglio', 'Idea → space → detail')}</span></div>
    <div class="lens rv"><span class="tag">F/V — ${t('Appunti di progetto', 'Project notes')}</span><p>${v(p.lens)}</p><span class="hand">${t('dalle persone, alla forma.', 'from people, to form.')}</span></div>
    <div class="scrolly">
      <div class="steps">${p.chapters.map((c, k) => `<div class="step" data-k="${k}"><span class="step-num">${num(k + 1)} / ${num(p.chapters.length)}</span><h2>${v(c.title)}</h2><p>${v(c.body)}</p><button class="step-media" type="button" data-light="story:${k + 1}" aria-label="${t('Ingrandisci', 'Enlarge')} ${esc(v(c.image.cap))}">${pic(c.image.name, v(c.image.cap), { sizes: '100vw' })}</button></div>`).join('')}</div>
      <div class="story-figure">${p.chapters.map((c, k) => `<figure class="sf${k === 0 ? ' on' : ''}${(dims[c.image.name] || [])[2] === 'drawing' ? ' is-drawing' : ''}" data-k="${k}"><button type="button" data-light="story:${k + 1}" data-cursor="${C('Ingrandisci', 'Enlarge')}" aria-label="${t('Ingrandisci', 'Enlarge')} ${esc(v(c.image.cap))}">${pic(c.image.name, v(c.image.cap), { sizes: '55vw' })}</button><figcaption><span>${v(c.image.cap)}</span><span>${num(k + 1)}</span></figcaption></figure>`).join('')}<div class="sf-bar"><i></i></div></div>
    </div>
  </section>
  ${p.compare ? `<section class="p-compare"><div class="section-label"><span>${t('Esplora la trasformazione', 'Explore the transformation')}</span><span>${t('Trascina il cursore', 'Drag the handle')}</span></div><h2 class="h2 rv">${words(t('Un interno, due tempi.', 'One interior, two rhythms.'))}</h2><div class="compare" style="--split:50%" data-cursor="${C('Trascina', 'Drag')}">${pic(p.compare.before.name, v(p.compare.before.cap), { sizes: '90vw' })}<div class="compare-after">${pic(p.compare.after.name, v(p.compare.after.cap), { sizes: '90vw' })}</div><span class="compare-handle" aria-hidden="true"><b>↔</b></span><button type="button" class="compare-tag l">${t('Giorno', 'Day')}</button><button type="button" class="compare-tag r">${t('Notte', 'Night')}</button><input type="range" min="0" max="100" value="50" aria-label="${t('Confronto giorno e notte', 'Day and night comparison')}"></div></section>` : ''}
  <section class="p-gallery${pinned ? ' is-pinned' : ''}" id="gallery">
    <div class="hg-sticky"><div class="section-label"><span>02 / ${t('Immagini e processo', 'Images & process')}</span><span class="hg-count">${p.gallery.length} ${t('immagini', 'images')}</span></div>
    <div class="hg-track">${p.gallery.map((g, k) => { const d = dims[g.name] || [3, 2]; return `<figure class="hg-item rv" style="--ar:${(d[0] / d[1]).toFixed(3)}"><button type="button" data-light="story:${p.chapters.length + 1 + k}" data-cursor="${C('Ingrandisci', 'Enlarge')}" aria-label="${t('Ingrandisci', 'Enlarge')} ${esc(v(g.cap))}">${pic(g.name, v(g.cap), { sizes: pinned ? '(max-width:900px) 100vw, 60vw' : '(max-width:900px) 100vw, 50vw' })}</button><figcaption><span>${num(k + 1)}</span><span>${v(g.cap)}</span></figcaption></figure>` }).join('')}</div>
    ${pinned ? '<div class="hg-progress"><i></i></div>' : ''}</div>
  </section>
  ${atlasMarkup(p)}
  <a class="p-next" href="#${next.id}" data-cursor="${C('Prossimo', 'Next')}"><span class="p-next-label">${t('Progetto successivo', 'Next project')} — ${num((i + 1) % N + 1)}</span><span class="p-next-name">${next.name}</span><span class="p-next-media">${pic(next.cover.name, '', { sizes: '40vw' })}</span></a>
  ${footer()}</article>`;
  light.story = story;
  bindAtlas(p);
  // scrollytelling
  const figs = $$('.sf'), barI = $('.sf-bar i'), steps = $$('.step');
  if ('IntersectionObserver' in window) {
    const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const k = +e.target.dataset.k; figs.forEach((f, j) => f.classList.toggle('on', j === k)); steps.forEach((s, j) => s.classList.toggle('on', j === k)); barI.style.transform = `scaleX(${(k + 1) / steps.length})` } }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => so.observe(s)); onCleanup(() => so.disconnect());
  }
  // hero parallax
  const heroImg = $('.p-hero-media img'), title = $('.p-title');
  onScroll(() => { if (reduced.matches) return; const y = Math.min(scrollY, innerHeight); heroImg.style.transform = `translate3d(0,${y * .25}px,0) scale(${1 + y / innerHeight * .08})`; title.style.transform = `translate3d(0,${y * -.15}px,0)`; title.style.opacity = String(1 - y / innerHeight * 1.2) });
  // horizontal pinned gallery
  const g = $('.p-gallery'), track = $('.hg-track'), hgp = $('.hg-progress i');
  if (pinned) {
    const size = () => { const active = innerWidth > 900 && !reduced.matches; g.classList.toggle('pin-on', active); g.style.height = active ? `${track.scrollWidth - innerWidth + innerHeight + innerWidth * .08}px` : '' };
    size(); listen(window, 'resize', size);
    $$('img', track).forEach(im => im.complete || im.addEventListener('load', size, { once: true }));
    onScroll(() => { if (!g.classList.contains('pin-on')) { track.style.transform = ''; return } const r = g.getBoundingClientRect(), max = g.offsetHeight - innerHeight, pr = clamp(-r.top / max, 0, 1); track.style.transform = `translate3d(${-pr * (track.scrollWidth - innerWidth + innerWidth * .08)}px,0,0)`; hgp.style.transform = `scaleX(${pr})` });
  }
  // compare
  const cmp = $('.compare');
  if (cmp) {
    const range = $('input', cmp), set = x => { cmp.style.setProperty('--split', x + '%'); range.value = x };
    range.oninput = () => set(+range.value);
    let dragging = false;
    const at = e => { const r = cmp.getBoundingClientRect(); set(clamp((e.clientX - r.left) / r.width * 100, 0, 100)) };
    cmp.addEventListener('pointerdown', e => { if (e.target.closest('.compare-tag')) return; dragging = true; cmp.setPointerCapture(e.pointerId); at(e) });
    cmp.addEventListener('pointermove', e => dragging && at(e));
    cmp.addEventListener('pointerup', () => dragging = false);
    $$('.compare-tag').forEach(b => b.addEventListener('click', () => set(b.classList.contains('l') ? 100 : 0)));
    if (!reduced.matches && 'IntersectionObserver' in window) {
      const co = new IntersectionObserver(es => { if (es[0].isIntersecting) { co.disconnect(); let t0 = performance.now(); const anim = now => { if (dragging) return; const k = (now - t0) / 1600; if (k >= 1) { set(50); return } set(50 + Math.sin(k * Math.PI * 2) * 22); requestAnimationFrame(anim) }; requestAnimationFrame(anim) } }, { threshold: .6 });
      co.observe(cmp); onCleanup(() => co.disconnect());
    }
  }
  $$('[data-light]').forEach(b => b.addEventListener('click', () => { const [list, k] = b.dataset.light.split(':'); openLight(list === 'story' ? light.story : light.atlas, +k, b) }));
  $('.p-next').addEventListener('click', e => { const im = $('.p-next-media img'); if (im && fine.matches) im.style.viewTransitionName = 'hero' });
  magnetic(main);
}

/* ---------- Technical atlas ---------- */
const kinds = { all: P('Tutte', 'All'), plan: P('Piante', 'Plans'), section: P('Sezioni / Prospetti', 'Sections / Elevations'), detail: P('Dettagli', 'Details'), board: P('Tavole', 'Boards') };
function atlasMarkup(p) {
  const ks = ['all', ...new Set(p.technical.map(s => s.kind))];
  return `<section class="p-atlas" id="atlas">
  <div class="section-label"><span>03 / ${t('Atlante tecnico', 'Technical atlas')}</span><span>${p.technical.length} ${t('elaborati', 'drawings')}</span></div>
  <div class="atlas-head"><h2 class="h2 rv">${words(t('Dal pensiero<br>alla costruzione.', 'From thought<br>to construction.'))}</h2><p>${t('Piante, sezioni e dettagli originali. Scegli una tavola, avvicinati, esplora: doppio clic per ingrandire, trascina per muoverti.', 'Original plans, sections and details. Choose a drawing, zoom in, explore: double-click to zoom, drag to move around.')}</p></div>
  ${ks.length > 2 ? `<div class="filters atlas-filters" role="group" aria-label="${t('Tipo di elaborato', 'Drawing type')}">${ks.map(k => `<button type="button" data-k="${k}" aria-pressed="${k === 'all'}">${v(kinds[k])}</button>`).join('')}</div>` : ''}
  <div class="atlas">
    <ol class="atlas-list">${p.technical.map((s, k) => `<li data-kind="${s.kind}"><button type="button" data-a="${k}" aria-current="${k === 0}"><span>${num(k + 1)}</span>${v(s.cap)}</button></li>`).join('')}</ol>
    <div class="atlas-view">
      <div class="atlas-stage" tabindex="0" role="region" aria-label="${esc(v(p.technical[0].cap))}" data-cursor="${C('Esplora', 'Explore')}"><div class="atlas-paper"></div></div>
      <div class="atlas-tools"><button type="button" class="z-out" aria-label="${t('Riduci', 'Zoom out')}">−</button><output class="z-val">100%</output><button type="button" class="z-in" aria-label="${t('Ingrandisci tavola', 'Zoom in')}">+</button><button type="button" class="z-fit">${t('Adatta', 'Fit')}</button><span class="a-status" aria-live="polite"></span><button type="button" class="a-full">${t('Schermo intero', 'Full screen')} ↗</button><a class="a-down" download>${t('Scarica', 'Download')} ↓</a></div>
    </div>
  </div>
  <p class="note">${t('Elaborati originali del progetto. Le scritte integrate nelle tavole mantengono la lingua originale.', 'Original project drawings. Text embedded in the drawings retains its original language.')}</p></section>`;
}
function bindAtlas(p) {
  light.atlas = p.technical;
  const stage = $('.atlas-stage'), paper = $('.atlas-paper'), out = $('.z-val');
  let cur = 0, z = 1, x = 0, y = 0;
  const apply = () => {
    const im = $('img', paper);
    if (z > 1 && im && !im.dataset.hi) { im.dataset.hi = '1'; const full = new Image(); full.src = src(p.technical[cur].name); full.decode().then(() => { if ($('img', paper) === im) { im.removeAttribute('srcset'); im.src = full.src } }, () => {}) }
    paper.style.transform = `translate3d(${x}px,${y}px,0) scale(${z})`; out.textContent = Math.round(z * 100) + '%'; $('.z-out').disabled = z <= 1; $('.z-in').disabled = z >= 4; stage.classList.toggle('zoomed', z > 1) };
  const bound = () => { const r = stage.getBoundingClientRect(), mx = r.width * (z - 1) / 2, my = r.height * (z - 1) / 2; x = clamp(x, -mx, mx); y = clamp(y, -my, my) };
  const zoom = (nz, cx = 0, cy = 0) => { nz = clamp(nz, 1, 4); x = (x - cx) * nz / z + cx; y = (y - cy) * nz / z + cy; z = nz; bound(); apply() };
  function show(k) {
    cur = k; const s = p.technical[k];
    paper.innerHTML = pic(s.name, v(s.cap), { sizes: '(max-width:900px) 100vw, 70vw' });
    const im = $('img', paper); im.classList.add('loading'); im.addEventListener('load', () => im.classList.remove('loading'), { once: true });
    stage.setAttribute('aria-label', v(s.cap)); $('.a-status').textContent = `${num(k + 1)} / ${num(p.technical.length)} — ${v(s.cap)}`;
    $('.a-down').href = src(s.name); $('.a-down').setAttribute('download', s.name + '.webp');
    $$('.atlas-list button').forEach(b => b.setAttribute('aria-current', String(+b.dataset.a === k)));
    z = 1; x = y = 0; apply();
  }
  $$('.atlas-list button').forEach(b => b.onclick = () => show(+b.dataset.a));
  $$('.atlas-filters button').forEach(b => b.onclick = () => { const k = b.dataset.k; $$('.atlas-filters button').forEach(o => o.setAttribute('aria-pressed', String(o === b))); let first = -1; $$('.atlas-list li').forEach((li, i) => { const on = k === 'all' || li.dataset.kind === k; li.hidden = !on; if (on && first < 0) first = i }); if (first >= 0) show(first) });
  $('.z-in').onclick = () => zoom(z + .5); $('.z-out').onclick = () => zoom(z - .5); $('.z-fit').onclick = () => { z = 1; x = y = 0; apply() };
  $('.a-full').onclick = e => openLight(light.atlas, cur, e.currentTarget);
  stage.addEventListener('dblclick', e => { const r = stage.getBoundingClientRect(); const cx = e.clientX - r.left - r.width / 2, cy = e.clientY - r.top - r.height / 2; z > 1 ? zoom(1) : zoom(2.5, cx, cy) });
  stage.addEventListener('wheel', e => { if (!(e.ctrlKey || e.metaKey) && z === 1) return; e.preventDefault(); const r = stage.getBoundingClientRect(); zoom(z * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2) }, { passive: false });
  let d = null;
  stage.addEventListener('pointerdown', e => { if (z === 1) return; d = { x: e.clientX - x, y: e.clientY - y }; stage.setPointerCapture(e.pointerId); stage.classList.add('panning') });
  stage.addEventListener('pointermove', e => { if (!d) return; x = e.clientX - d.x; y = e.clientY - d.y; bound(); apply() });
  stage.addEventListener('pointerup', () => { d = null; stage.classList.remove('panning') });
  stage.addEventListener('keydown', e => { const m = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }[e.key]; if (e.key === '+' || e.key === '=') zoom(z + .5); else if (e.key === '-') zoom(z - .5); else if (m && z > 1) { e.preventDefault(); x += m[0]; y += m[1]; bound(); apply() } });
  show(0);
}

/* =========================================================
   ABOUT
   ========================================================= */
function about() {
  const groups = [[t('Parametrico e CAD', 'Parametric & CAD'), ['Rhino', 'Grasshopper', 'AutoCAD', 'Autodesk Inventor', 'Revit']], [t('Modellazione e render', 'Modelling & rendering'), ['Blender', 'V-Ray', '3ds Max', 'D5 Render']], [t('Grafica e dati', 'Graphics & data'), ['Photoshop', 'Illustrator', 'InDesign', 'Excel']], [t('Codice', 'Code'), ['JavaScript', 'C#', 'HTML', 'CSS', 'SQL', t('sviluppo con agenti AI', 'AI-agent development')]], [t('Fabbricazione', 'Fabrication'), [t('Stampa 3D a resina e filamento', 'Resin & filament 3D printing'), t('Prototipazione', 'Prototyping')]]];
  const tools = groups.flatMap(g => g[1]);
  main.innerHTML = `<section class="page about-page">
  <div class="page-head"><span>${t('Info / Contatti', 'About / Contact')}</span><span>Product &amp; Interior Designer · Computational Design · Prototyping</span></div>
  <h1 class="display rv">${words(t('La forma nasce<br>dall’esperienza.', 'Form begins<br>with experience.'))}</h1>
  <div class="about-grid">
    <figure class="portrait rv">${pic('about-ritratto', 'Filippo Antonio Visentin', { sizes: '(max-width:900px) 100vw, 40vw', eager: true })}<figcaption>Filippo Antonio Visentin — ${t('Milano · Vicenza', 'Milan · Vicenza')}</figcaption></figure>
    <div class="about-text">
      <h2 class="rv">Filippo Antonio<br>Visentin</h2>
      <p class="avail rv"><span class="dot" aria-hidden="true"></span>${t('Disponibile per collaborazioni — Milano · in sede, ibrido o da remoto', 'Open to work — Milan · on site, hybrid or remote')}</p>
      <div class="downloads rv">${profile.docs.map(d => `<a class="dl magnetic" href="${d.href}" target="_blank" rel="noopener noreferrer" type="application/pdf" data-cursor="${C('Apri PDF', 'Open PDF')}"><span class="dl-icon" aria-hidden="true">↓</span><span class="dl-text"><b>${v(d.label)}</b><small>${v(d.meta)}</small></span><span class="sr-only"> (${t('si apre in una nuova scheda', 'opens in a new tab')})</span></a>`).join('')}</div>
      <p class="lead rv">${t('Sono un designer di prodotto e d’interni. La mia ricerca muove dall’osservazione delle interazioni tra le persone e dei modi reali in cui spazi e oggetti vengono abitati e utilizzati, perché la forma derivi dall’uso e non lo preceda.', 'I am a product and interior designer. My research starts from observing how people interact and how spaces and objects are actually lived in and used, so that form follows use rather than preceding it.')}</p>
      <p class="rv">${t('Interpreto il design come un gesto che accompagna l’esperienza anziché imporsi, e cerco l’equilibrio tra rigore tecnico e qualità materica. Materiali e luce sono strumenti progettuali che uso per dare calore e carattere; il riferimento alla natura si traduce in un linguaggio contemporaneo.', 'I see design as a gesture that accompanies experience instead of imposing itself, and I look for a balance between technical rigour and material quality. Materials and light are design tools I use to give warmth and character, while references to nature are translated into a contemporary language.')}</p>
      <p class="rv">${t('Nell’ultimo periodo mi dedico alla progettazione e prototipazione di pezzi stampati in 3D, a resina e a filamento, e allo sviluppo di strumenti digitali come <a class="inline" href="#code">Forma</a>, il mio modellatore 3D open source: è il mio modo di <a class="inline" href="#code">progettare con l’AI</a>.', 'Recently I have been focusing on designing and prototyping parts made with resin and filament 3D printing, and on building digital tools such as <a class="inline" href="#code">Forma</a>, my open-source 3D modeller: it is how I <a class="inline" href="#code">design with AI</a>.')}</p>
      <dl class="cv rv">
        <div><dt>${t('Formazione', 'Education')}</dt><dd><b>2026–2028</b> · ${t('Master universitario di primo livello in Design Engineering for Innovation — POLI.design, Politecnico di Milano', 'First-level university master in Design Engineering for Innovation — POLI.design, Politecnico di Milano')}<br><b>2023–2026</b> · ${t('Laurea triennale in Design degli Interni — Politecnico di Milano', 'B.Sc. in Interior Design — Politecnico di Milano')}<br><b>${t('Fino al 2023', 'Until 2023')}</b> · ${t('Diploma tecnico in Telecomunicazioni — ITIS A. Rossi, Vicenza', 'Technical diploma in Telecommunications — ITIS A. Rossi, Vicenza')}</dd></div>
        <div><dt>${t('Certificazioni', 'Certifications')}</dt><dd><b>2025</b> · ${t('Abilitazione alla stampa 3D — Politecnico di Milano', '3D printing qualification — Politecnico di Milano')}</dd></div>
        <div><dt>${t('Esperienze', 'Experience')}</dt><dd><b>${t('Oggi', 'Now')}</b> · Freelance — ${t('progettazione, prototipazione e stampa 3D su commissione', 'design, prototyping and 3D printing on commission')}<br><b>${t('Mag–ago 2022', 'May–Aug 2022')}</b> · Zincol Italia — ${t('tirocinio nell’ufficio IT durante il quarto anno delle superiori, a supporto dei sistemi interni e dell’infrastruttura', 'IT department internship during the fourth year of high school, supporting internal systems and infrastructure')}<br><b>2025–2026</b> · ALDI Italia, Milano — ${t('addetto vendita: cassa, rifornimento, allestimento secondo gli standard espositivi, assistenza clienti', 'sales associate: checkout, restocking, store layout to display standards, customer assistance')}<br><b>2021–2023</b> · La Capannina, Barbarano Vicentino — ${t('da cameriere a responsabile di sala: coordinamento del team, turni e qualità del servizio', 'from waiter to floor manager: team coordination, shift planning and service quality')}</dd></div>
        <div><dt>${t('Strumenti', 'Tools')}</dt><dd>${groups.map(([g, l]) => `<span class="tool-g">${g}</span> ${l.join(' · ')}`).join('<br>')}</dd></div>
        <div><dt>${t('Lingue', 'Languages')}</dt><dd>${t('Italiano C2 · Inglese B2 · Francese B1', 'Italian C2 · English B2 · French B1')}</dd></div>
        <div><dt>${t('Interessi', 'Interests')}</dt><dd>${t('Montagna e alpinismo, riferimento personale e progettuale ricorrente · stampa 3D e sperimentazione su materiali e processi · droni FPV: costruzione, configurazione, programmazione e riprese aeree.', 'Mountaineering, a recurring personal and design reference · 3D printing and experiments with materials and processes · FPV drones: building, configuring, programming and aerial footage.')}</dd></div>
      </dl>
    </div>
  </div>
  <div class="marquee" aria-label="${t('Strumenti', 'Tools')}: ${esc(tools.join(', '))}"><div class="marquee-track" aria-hidden="true">${[0, 1].map(() => `<span>${tools.map(x => `${x}<i>✦</i>`).join('')}</span>`).join('')}</div></div>
  <section class="contact">
    <span class="tag">${t('Iniziamo una conversazione', 'Start a conversation')}</span>
    <h2 class="rv">${words(t('Mettiamoci<br>in relazione.', 'Let’s<br>connect.'))}</h2>
    <div class="contact-row"><a class="mail" href="mailto:${profile.email}">filippoantonio.visentin<wbr>@mail.polimi.it</a><button type="button" class="copy magnetic">${t('Copia indirizzo', 'Copy address')}</button></div>
    <div class="socials">${ext(profile.linkedin, 'LinkedIn ↗', 'social magnetic')}${ext(profile.github, 'GitHub ↗', 'social magnetic')}</div>
  </section>
  ${footer()}</section>`;
  $('.copy').onclick = async e => { const b = e.currentTarget; try { await navigator.clipboard.writeText(profile.email); b.textContent = t('Copiato ✓', 'Copied ✓') } catch { b.textContent = t('Copia non riuscita', 'Copy failed') } b.classList.add('done'); setTimeout(() => { b.textContent = t('Copia indirizzo', 'Copy address'); b.classList.remove('done') }, 2200) };
  magnetic(main);
}

/* =========================================================
   CODE — GitHub section, FORMA
   ========================================================= */
function code() {
  const f = forma, shots = f.shots, [hero, ...rest] = shots;
  main.innerHTML = `<article class="project is-dark code-page">
  <header class="c-hero">
    <div class="c-hero-text">
      <span class="tag">${v(f.kicker)}</span>
      <h1 class="c-title" aria-label="${f.name}"><span aria-hidden="true">${letters(f.name)}</span></h1>
      <p class="c-sub">${v(f.subtitle)}</p>
      <div class="c-actions">${ext(f.repo, 'GitHub ↗', 'btn btn-acid magnetic')}${ext(f.release, `${t('Scarica per Windows', 'Download for Windows')} ↓`, 'btn magnetic')}</div>
    </div>
    <div class="c-window-wrap"><div class="c-window"><div class="c-window-bar" aria-hidden="true"><i></i><i></i><i></i><span>forma.exe — soggiorno.3dm</span></div><button type="button" data-light="0" data-cursor="${C('Ingrandisci', 'Enlarge')}" aria-label="${t('Ingrandisci', 'Enlarge')} ${esc(v(hero.cap))}">${pic(hero.name, v(hero.cap), { eager: true, sizes: '(max-width:900px) 100vw, 55vw' })}</button></div></div>
  </header>
  <section class="p-intro">
    <p class="p-question rv">${words(v(f.question))}</p>
    <div class="p-intro-grid">
      <dl class="c-stats rv">${f.stats.map(([n, l]) => `<div><dt class="count-up" data-to="${n}">${n}</dt><dd>${v(l)}</dd></div>`).join('')}</dl>
      <div class="p-text rv"><p class="lead">${v(f.intro)}</p><p>${v(f.text)}</p></div>
    </div>
  </section>
  <section class="c-block c-method">
    <div class="section-label"><span>01 / ${t('Progettare con l’AI', 'Designing with AI')}</span><span>${t('Il metodo dietro Forma', 'The method behind Forma')}</span></div>
    <div class="method-grid">
      <div><h2 class="h2 rv">${words(v(f.method.title))}</h2><p class="lead rv">${v(f.method.lead)}</p></div>
      <ol class="method-steps">${f.method.steps.map(([h, d], k) => `<li class="rv" style="--k:${k}"><span class="mono">${num(k + 1)}</span><b>${v(h)}</b><p>${v(d)}</p></li>`).join('')}</ol>
    </div>
  </section>
  <section class="c-block c-ai">
    <div class="section-label"><span>02 / Ask AI</span><span>${t('AI locale, nessun cloud', 'Local AI, no cloud')}</span></div>
    <div class="ai-grid">
      <figure class="phone rv"><div class="phone-screen"><video class="ai-video" muted loop playsinline preload="none" poster="${f.ai.poster}" aria-label="${esc(v(f.ai.label))}"><source src="${f.ai.video}" type="video/mp4"></video><button type="button" class="ai-toggle" aria-pressed="false" aria-label="${t('Riproduci la demo', 'Play the demo')}" data-cursor="${C('Play', 'Play')}"><i aria-hidden="true"></i></button></div><figcaption>${v(f.ai.label)}</figcaption></figure>
      <div class="ai-text">
        <h2 class="h2 rv">${words(v(f.ai.title))}</h2>
        <p class="lead rv">${v(f.ai.text)}</p>
        <ol class="ai-examples rv">${f.ai.examples.map(([a, b], k) => `<li><span class="mono">${num(k + 1)}</span><b>${v(a)}</b><span>${v(b)}</span></li>`).join('')}</ol>
        <div class="ai-steps rv"><span class="tag">${t('Come si attiva', 'How to turn it on')}</span><ol>${f.ai.steps.map(s => `<li>${esc(v(s)).replace(/(ollama pull \S+)/, '<code>$1</code>')}</li>`).join('')}</ol></div>
        <p class="ai-badge rv"><span class="dot" aria-hidden="true"></span>${v(f.ai.badge)}</p>
      </div>
    </div>
  </section>
  <section class="c-block">
    <div class="section-label"><span>03 / ${t('Riga di comando', 'Command line')}</span><span>${t('Scrivi e la stanza prende forma', 'Type and the room takes shape')}</span></div>
    <div class="terminal rv" role="img" aria-label="${esc(f.terminal.map(([c]) => c).join(', '))}"><div class="terminal-bar" aria-hidden="true"><i></i><i></i><i></i><span>forma — command line</span></div><pre class="terminal-body" aria-hidden="true"></pre></div>
  </section>
  <section class="c-block">
    <div class="section-label"><span>04 / ${t('Interfaccia', 'Interface')}</span><span>${rest.length} ${t('schermate', 'screenshots')}</span></div>
    <div class="c-shots">${rest.map((s, k) => `<figure class="hg-item rv" style="--ar:${(dims[s.name][0] / dims[s.name][1]).toFixed(3)}"><button type="button" data-light="${k + 1}" data-cursor="${C('Ingrandisci', 'Enlarge')}" aria-label="${t('Ingrandisci', 'Enlarge')} ${esc(v(s.cap))}">${pic(s.name, v(s.cap), { sizes: '(max-width:900px) 100vw, 50vw' })}</button><figcaption><span>${num(k + 1)}</span><span>${v(s.cap)}</span></figcaption></figure>`).join('')}</div>
  </section>
  <section class="c-block">
    <div class="section-label"><span>05 / ${t('Architettura', 'Architecture')}</span><span>${t('Ogni strato dipende solo da quelli sotto', 'Each layer depends only on those below')}</span></div>
    <h2 class="h2 rv">${words(t('Tutto è<br>un comando.', 'Everything is<br>a command.'))}</h2>
    <ol class="c-layers">${f.layers.map(([n, d], k) => `<li class="rv" style="--k:${k}"><span class="mono">${n}</span><span>${v(d)}</span></li>`).join('')}</ol>
    <ul class="c-stack" aria-label="${t('Tecnologie', 'Technologies')}">${f.stack.map(s => `<li>${s}</li>`).join('')}</ul>
  </section>
  <section class="c-block">
    <div class="section-label"><span>06 / GitHub</span>${ext(profile.github, 'github.com/filippovisentin ↗')}</div>
    <ul class="repos">${repos.map(r => `<li><a class="repo" href="${r.url}" target="_blank" rel="noopener noreferrer" data-cursor="${C('Apri', 'Open')}"><span class="repo-name">${r.name}<span class="sr-only"> (${t('si apre in una nuova scheda', 'opens in a new tab')})</span></span><span class="repo-desc">${v(r.desc)}</span><span class="repo-lang"><i data-l="${r.lang}"></i>${r.lang}</span><span class="row-arrow" aria-hidden="true">↗</span></a>${r.live ? ext(r.live, `${t('Sito', 'Live site')} ↗`, 'repo-live') : ''}</li>`).join('')}</ul>
    <p class="note">${v(f.note)}</p>
  </section>
  ${footer()}</article>`;
  light.story = shots;
  $$('[data-light]').forEach(b => b.addEventListener('click', () => openLight(shots, +b.dataset.light, b)));
  // window tilt
  const win = $('.c-window');
  if (fine.matches && !reduced.matches) {
    let rx = 0, ry = 0, qx = 0, qy = 0, raf = 0;
    const tick = () => { qx = lerp(qx, rx, .08); qy = lerp(qy, ry, .08); win.style.transform = `rotateX(${qy}deg) rotateY(${qx}deg)`; raf = Math.abs(qx - rx) + Math.abs(qy - ry) > .01 ? requestAnimationFrame(tick) : 0 };
    listen(window, 'pointermove', e => { rx = (e.clientX / innerWidth - .5) * 14; ry = (e.clientY / innerHeight - .5) * -10; if (!raf) raf = requestAnimationFrame(tick) });
    onCleanup(() => cancelAnimationFrame(raf));
  }
  // counters
  const counters = $$('.count-up');
  const runCount = el => { const m = /^(~?)(\d+)(k?)$/.exec(el.dataset.to); if (!m || reduced.matches) return; const to = +m[2], t0 = performance.now(); const step = now => { const k = Math.min(1, (now - t0) / 1000), e = 1 - Math.pow(1 - k, 4); el.textContent = m[1] + Math.round(to * e) + m[3]; if (k < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) };
  // terminal typing
  const term = $('.terminal-body'), prompt = `<span class="t-p">${t('Comando', 'Command')}:</span> `;
  const lines = f.terminal.map(([c, d]) => [c, v(d)]);
  const done = () => lines.map(([c, d]) => `${prompt}${esc(c)}\n<span class="t-c">  → ${esc(d)}</span>\n`).join('') + `${prompt}<span class="t-cur"></span>`;
  let typing = 0;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const type = async () => {
    if (reduced.matches) { term.innerHTML = done(); return }
    const id = ++typing; let html = '';
    for (const [c, d] of lines) {
      for (let i = 0; i <= c.length; i++) { if (id !== typing) return; term.innerHTML = `${html}${prompt}${esc(c.slice(0, i))}<span class="t-cur"></span>`; await wait(38 + Math.random() * 40) }
      html += `${prompt}${esc(c)}\n<span class="t-c">  → ${esc(d)}</span>\n`;
      term.innerHTML = html; await wait(380);
    }
    if (id === typing) term.innerHTML = done();
  };
  onCleanup(() => typing++);
  if ('IntersectionObserver' in window) {
    const o = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; o.unobserve(e.target); if (e.target === term) type(); else runCount(e.target) }), { threshold: .4 });
    [term, ...counters].forEach(x => o.observe(x)); onCleanup(() => o.disconnect());
  } else term.innerHTML = done();
  // AI demo video: plays muted while visible, a button pauses it
  const vid = $('.ai-video'), tog = $('.ai-toggle');
  let userPaused = reduced.matches;
  const sync = () => { const on = !vid.paused; tog.setAttribute('aria-pressed', String(on)); tog.setAttribute('aria-label', on ? t('Metti in pausa la demo', 'Pause the demo') : t('Riproduci la demo', 'Play the demo')); tog.closest('.phone').classList.toggle('playing', on) };
  const play = () => { vid.preload = 'auto'; vid.play().then(sync, sync) };
  vid.addEventListener('pause', sync); vid.addEventListener('play', sync);
  tog.addEventListener('click', () => { if (vid.paused) { userPaused = false; play() } else { userPaused = true; vid.pause() } });
  if ('IntersectionObserver' in window) {
    const vo = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !userPaused) play(); else if (!e.isIntersecting) vid.pause() }), { threshold: .35 });
    vo.observe(vid); onCleanup(() => { vo.disconnect(); vid.pause() });
  }
  magnetic(main);
}

/* =========================================================
   LIGHTBOX
   ========================================================= */
const lb = $('#lightbox'), lbImg = $('#lightbox img'), lbCap = $('#lightbox figcaption'), lbCount = $('.light-count');
let lbZoom = false, lbReturn = null;
function openLight(list, k, from) {
  light.cur = list; light.i = (k + list.length) % list.length; const g = list[light.i];
  lbImg.classList.add('swap');
  const im = new Image(); im.src = src(g.name);
  const done = () => { lbImg.src = im.src; lbImg.alt = v(g.cap); lbImg.classList.remove('swap') };
  im.decode ? im.decode().then(done, done) : (im.onload = done);
  lbCap.textContent = v(g.cap); lbCount.textContent = `${num(light.i + 1)} / ${num(list.length)}`;
  setZoom(false);
  if (!lb.open) { lbReturn = from || document.activeElement; lb.showModal(); document.documentElement.classList.add('lock') }
}
function setZoom(on, e) { lbZoom = on; lb.classList.toggle('zoom', on); if (on && e) { const r = lbImg.getBoundingClientRect(); lbImg.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%` } }
function afterClose() { if (!document.documentElement.classList.contains('lock')) return; document.documentElement.classList.remove('lock'); lbImg.removeAttribute('src'); setZoom(false); lbReturn?.focus?.({ preventScroll: true }) }
function closeLight() { if (lb.open) lb.close(); afterClose() }
$('.close', lb).onclick = closeLight;
lb.addEventListener('cancel', e => { e.preventDefault(); closeLight() });
lb.addEventListener('close', afterClose);
$('.light-prev').onclick = () => openLight(light.cur, light.i - 1); $('.light-next').onclick = () => openLight(light.cur, light.i + 1);
lb.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); openLight(light.cur, light.i + 1) } if (e.key === 'ArrowLeft') { e.preventDefault(); openLight(light.cur, light.i - 1) } });
lbImg.addEventListener('click', e => setZoom(!lbZoom, e));
lbImg.addEventListener('pointermove', e => { if (lbZoom) { const r = lbImg.getBoundingClientRect(); lbImg.style.transformOrigin = `${clamp((e.clientX - r.left) / r.width * 100, 0, 100)}% ${clamp((e.clientY - r.top) / r.height * 100, 0, 100)}%` } });
let sw = null;
lb.addEventListener('touchstart', e => { if (e.touches.length === 1) sw = { x: e.touches[0].clientX, y: e.touches[0].clientY } }, { passive: true });
lb.addEventListener('touchend', e => { if (!sw || lbZoom) return; const dx = e.changedTouches[0].clientX - sw.x, dy = e.changedTouches[0].clientY - sw.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) openLight(light.cur, light.i + (dx < 0 ? 1 : -1)); else if (dy > 90) closeLight(); sw = null });
lb.addEventListener('click', e => { if (e.target === lb || e.target.tagName === 'FIGURE') closeLight() });

/* =========================================================
   ROUTER + VIEW TRANSITIONS
   ========================================================= */
function staticText() {
  document.documentElement.lang = lang;
  $$('[data-it]').forEach(e => e.textContent = e.dataset[lang]);
  $('#language').textContent = lang === 'it' ? 'EN' : 'IT';
  $('#language').setAttribute('aria-label', lang === 'it' ? 'EN — Switch to English' : 'IT — Passa a italiano');
  lb.setAttribute('aria-label', t('Galleria immagini', 'Image gallery'));
  $('.close', lb).setAttribute('aria-label', t('Chiudi', 'Close'));
  $('.light-prev').setAttribute('aria-label', t('Immagine precedente', 'Previous image'));
  $('.light-next').setAttribute('aria-label', t('Immagine successiva', 'Next image'));
}
function render() {
  cleanup(); cleanup = () => {};
  staticText();
  const route = location.hash.slice(1) || 'home', p = projects.find(x => x.id === route);
  document.body.dataset.route = p ? 'project' : ['home', 'index', 'about', 'code'].includes(route) ? route : 'index';
  $$('nav a').forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + route || (route !== 'home' && !p && a.getAttribute('href') === '#index' && route === 'index'))));
  if (route === 'home') home(); else if (route === 'about') about(); else if (route === 'code') code(); else if (p) project(p); else index();
  document.title = route === 'home' ? 'Filippo Antonio Visentin — Selected works' : `${p ? p.name : route === 'about' ? t('Info', 'About') : route === 'code' ? 'FORMA — ' + t('Codice', 'Code') : t('Progetti', 'Work')} — Filippo Antonio Visentin`;
  $$('.to-top').forEach(b => b.onclick = () => scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' }));
  reveal(main);
  requestAnimationFrame(() => document.body.classList.add('ready'));
}
function navigate(keepScroll) {
  const y = scrollY;
  const run = () => { render(); scrollTo(0, keepScroll ? y : 0); };
  const named = $$('img').filter(el => el.style.viewTransitionName === 'hero');
  if (named.length > 1) named.filter(el => el.closest('.p-hero')).forEach(el => el.style.viewTransitionName = '');
  if (document.startViewTransition && !reduced.matches && !document.hidden) {
    const vt = document.startViewTransition(run);
    const reset = () => { $$('img').forEach(el => { if (!el.closest('.p-hero')) el.style.viewTransitionName = '' }) };
    vt.ready.catch(() => {}); vt.updateCallbackDone.catch(() => {});
    vt.finished.then(reset, reset);
  } else { $$('img').forEach(el => { if (!el.closest('.p-hero')) el.style.viewTransitionName = '' }); run() }
  main.focus({ preventScroll: true });
}
$('.skip').addEventListener('click', e => { e.preventDefault(); main.focus() });
$('#language').onclick = () => { lang = lang === 'it' ? 'en' : 'it'; try { localStorage.setItem('portfolio-language', lang) } catch {} render() };
addEventListener('hashchange', () => { closeLight(); navigate() });

/* ---------- Intro loader (once per session) ---------- */
const loader = $('.loader');
let seen = false; try { seen = sessionStorage.getItem('fav-intro') === '1' } catch {}
render();
if (seen || reduced.matches) loader.remove();
else {
  try { sessionStorage.setItem('fav-intro', '1') } catch {}
  // Grid: verticals every 10%, horizontals every 12.5%, two guide lines around the name
  const plane = $('.ld-plane'), cells = [];
  let html = '', k = 0;
  for (let x = 10; x <= 90; x += 10) html += `<i class="v" style="--x:${x}%;--i:${k++}"></i>`;
  for (let y = 12.5; y < 100; y += 12.5) html += `<i class="h" style="--y:${y}%;--i:${k++}"></i>`;
  html += `<i class="h a top" style="--i:${k++}"></i><i class="h a bot" style="--i:${k++}"></i>`;
  // Towers rise in a diagonal wave; heights follow a sine, colours are white, black and acid
  const cw = plane.clientWidth / 10, ch = plane.clientHeight / 8, m = cw * .12;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 10; c++) {
    const phone = innerWidth < 700;   // on phones: fewer towers and a wider clear band behind the name
    if ((r >= (phone ? 2 : 3) && r <= (phone ? 5 : 4) && c >= 1 && c <= 8) || Math.random() < (phone ? .6 : .5)) continue;
    const tone = Math.random() < .14 ? ' y' : Math.random() < .3 ? ' k' : '';
    cells.push(`<div class="bld${tone}" style="left:${c * cw + m}px;top:${r * ch + m}px;width:${cw - 2 * m}px;height:${ch - 2 * m}px;--h:${40 + 220 * (.5 + .5 * Math.sin(c * .7 + r * .9))}px;--dl:${(c + r) * 70}ms"><b class="sh"></b><b class="rf"></b><b class="n"></b><b class="s"></b><b class="w"></b><b class="e"></b></div>`);
  }
  plane.innerHTML = html + cells.join('');
  requestAnimationFrame(() => requestAnimationFrame(() => loader.classList.add('draw')));
  // Progress follows the first images of the page, never shorter than the drawing itself
  const n = $('.loader-count'), coords = $('.ld-coords'), imgs = $$('main img').slice(0, 10), t0 = performance.now();
  let loaded = 0; const total = Math.max(1, imgs.length);
  imgs.forEach(im => { if (im.complete) loaded++; else { const f = () => loaded++; im.addEventListener('load', f, { once: true }); im.addEventListener('error', f, { once: true }) } });
  const tick = now => {
    const time = Math.min(1, (now - t0) / 2900), p = Math.min(1, Math.min(loaded / total, time) * .6 + time * .4), e = 1 - Math.pow(1 - p, 3);
    n.textContent = String(Math.round(e * 100)).padStart(3, '0');
    coords.textContent = `X ${String(Math.round(e * 1440)).padStart(4, '0')} · Y ${String(Math.round(e * 900)).padStart(4, '0')} · 1:${Math.round(100 - e * 99)}`;
    if (p < 1 && now - t0 < 5500) return requestAnimationFrame(tick);
    n.textContent = '100';
    loader.classList.add('set');
    setTimeout(() => loader.classList.add('out'), 650);
    setTimeout(() => loader.remove(), 1700);
  };
  requestAnimationFrame(tick);
}
})();

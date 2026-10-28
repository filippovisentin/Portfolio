// Tavola / Indice, filtri e ripristino dello stato al ritorno.
// Una sola fonte: l'indice è costruito dalle voci della tavola.
// Senza JavaScript resta la tavola completa, senza comandi.
(() => {
  const controls = document.querySelector('.controls');
  const board = document.querySelector('#tavola');
  const table = document.querySelector('#indice');
  const tbody = table.querySelector('tbody');
  const status = controls.querySelector('.status');
  const works = [...board.querySelectorAll('.work[data-d]')];
  const labels = { all: ['Tutti', 'All'], exhibition: ['Exhibition', 'Exhibition'], architecture: ['Architettura', 'Architecture'], product: ['Product & service', 'Product & service'] };
  const en = () => document.documentElement.lang === 'en';
  const cell = (cls, it, enText) => `<td class="${cls}" data-it="${it}" data-en="${enText ?? it}">${en() ? enText ?? it : it}</td>`;
  const KEY = 'tavola-stato';

  // --- indice dalla tavola -------------------------------------------------
  for (const w of works) {
    const a = w.querySelector('a');
    const meta = w.querySelector('.meta');
    const split = s => { const p = s.split(' · '); const kind = p.pop(), year = p.pop(); return [p.join(' · '), year, kind] };
    const [disc, year, kind] = split(meta.dataset.it || meta.textContent);
    const [discEn, , kindEn] = split(meta.dataset.en || meta.textContent);
    const n = w.querySelector('.n').textContent, name = w.querySelector('.name').textContent;
    const tr = document.createElement('tr');
    tr.dataset.d = w.dataset.d;
    tr.innerHTML = `<td class="n mono">${n}</td>
      <td class="thumb"><span><img src="${w.querySelector('.line').getAttribute('src')}" alt="" loading="lazy"><img class="photo" src="${w.querySelector('.photo').getAttribute('src')}" alt="" loading="lazy"></span></td>
      <td class="name"><a href="${a.getAttribute('href')}">${name}</a><span class="sub mono" data-it="${disc} · ${year}" data-en="${discEn} · ${year}">${en() ? discEn : disc} · ${year}</span></td>
      ${cell('disc', disc, discEn)}<td class="year mono">${year}</td>${cell('kind mono', kind, kindEn)}
      <td class="arrow" aria-hidden="true">↗</td>`;
    tbody.append(tr);
  }

  // --- stato ---------------------------------------------------------------
  const read = () => {
    const q = new URLSearchParams(location.search);
    let saved = {};
    try { saved = JSON.parse(sessionStorage.getItem(KEY)) || {} } catch {}
    return {
      view: q.get('vista') || saved.view || 'tavola',
      filter: q.get('filtro') || saved.filter || 'all',
      scroll: saved.scroll || 0,
      last: saved.last || null
    };
  };
  const state = read();
  if (!['tavola', 'indice'].includes(state.view)) state.view = 'tavola';
  if (!(state.filter in labels)) state.filter = 'all';

  const save = (extra = {}) => {
    Object.assign(state, extra);
    const q = new URLSearchParams(location.search);
    q.set('vista', state.view);
    state.filter === 'all' ? q.delete('filtro') : q.set('filtro', state.filter);
    history.replaceState(null, '', `${location.pathname}?${q}${location.hash}`);
    try { sessionStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  };

  const render = () => {
    board.hidden = state.view !== 'tavola';
    table.hidden = state.view !== 'indice';
    const on = d => state.filter === 'all' || d === state.filter;
    // tavola: la composizione resta ferma, i lavori esclusi si ritirano e non ricevono focus
    for (const w of works) { w.classList.toggle('off', !on(w.dataset.d)); w.inert = !on(w.dataset.d) }
    // indice: le righe escluse spariscono
    for (const tr of tbody.rows) tr.classList.toggle('off', !on(tr.dataset.d));
    controls.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === state.view));
    controls.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', b.dataset.filter === state.filter));
    const count = works.filter(w => on(w.dataset.d)).length;
    const words = en() ? ['project', 'projects'] : ['progetto', 'progetti'];
    status.textContent = `${count} ${count === 1 ? words[0] : words[1]}${state.filter === 'all' ? '' : ' · ' + labels[state.filter][en() ? 1 : 0]}`;
    if (state.view === 'tavola') dispatchEvent(new Event('resize'));   // motion.js rimisura la profondità delle pile
  };

  controls.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.view) save({ view: b.dataset.view });
    if (b.dataset.filter) save({ filter: b.dataset.filter });
    render();
  });

  // ricorda progetto e posizione prima di uscire verso il caso studio
  document.querySelector('.views').addEventListener('click', e => {
    const a = e.target.closest('a');
    if (a) save({ last: a.getAttribute('href'), scroll: scrollY });
  });

  controls.hidden = false;
  render();
  addEventListener('langchange', render);   // il conteggio segue la lingua scelta

  // ritorno: posizione e focus sul progetto da cui si era usciti
  if (state.last) {
    const container = state.view === 'indice' ? table : board;
    const link = [...container.querySelectorAll('a')].find(a => a.getAttribute('href') === state.last);
    setTimeout(() => {
      scrollTo({ top: state.scroll, behavior: 'instant' });
      if (link && !link.closest('.off')) link.focus({ preventScroll: true });
    });
  }
})();

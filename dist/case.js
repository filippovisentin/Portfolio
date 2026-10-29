// Ritorno alla tavola: se si arriva dalla tavola, torna indietro nella cronologia
// (vista, filtro, posizione e focus restano quelli lasciati); altrimenti il link
// normale apre la tavola, che ripristina lo stato salvato nella sessione.
(() => {
  const fromBoard = (() => {
    try {
      const r = new URL(document.referrer);
      return r.origin === location.origin && /\/(index\.html)?$/.test(r.pathname);
    } catch { return false }
  })();
  document.querySelectorAll('[data-back]').forEach(a => a.addEventListener('click', e => {
    if (fromBoard && history.length > 1) { e.preventDefault(); history.back() }
  }));
  // all'arrivo il focus va al titolo, così lettori di schermo e tastiera partono dal progetto
  if (!location.hash) document.querySelector('h1')?.focus({ preventScroll: true });

  // Visore dell'atlante: il dettaglio si ingrandisce nella pagina.
  // Esc, × o clic sull'immagine chiudono; frecce per scorrere; il focus torna al dettaglio.
  const viewer = document.querySelector('#viewer');
  const items = [...document.querySelectorAll('.atlas .zoom')];
  if (!viewer || !items.length) return;
  const img = viewer.querySelector('img');
  const title = viewer.querySelector('#viewer-title');
  const count = viewer.querySelector('#viewer-count');
  let current = 0;

  const show = i => {
    current = (i + items.length) % items.length;
    const b = items[current];
    const [code, name] = [...b.querySelectorAll('.t > span')].map(s => s.textContent.trim());
    img.src = b.dataset.large;
    img.alt = `${document.documentElement.lang === 'en' ? 'Enlarged detail' : 'Dettaglio ingrandito'}: ${name}`;
    title.textContent = `${code} · ${name}`;
    count.textContent = `${current + 1} / ${items.length}`;
  };

  items.forEach((b, i) => b.addEventListener('click', () => { show(i); viewer.showModal() }));
  viewer.querySelector('.close').addEventListener('click', () => viewer.close());
  viewer.querySelector('.prev').addEventListener('click', () => show(current - 1));
  viewer.querySelector('.next').addEventListener('click', () => show(current + 1));
  img.addEventListener('click', () => viewer.close());
  viewer.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  addEventListener('langchange', () => { if (viewer.open) show(current) });
  // al termine riporta il focus al dettaglio mostrato per ultimo
  viewer.addEventListener('close', () => { img.removeAttribute('src'); items[current].focus() });
})();

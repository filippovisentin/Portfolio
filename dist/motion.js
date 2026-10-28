// Movimento del sito: comparsa allo scorrimento, immagini che si scoprono, profondità leggera.
// Sulla tavola i fogli delle pile stanno a profondità diverse. Regole e durate in motion.css.
// Con prefers-reduced-motion niente comparse né profondità.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- comparsa allo scorrimento
  if (!reduced && 'IntersectionObserver' in window) {
    const reveal = ['.section-head', '.chapter .txt', '.question > *', '.title .cartiglio', '.atlas li', '.affini li', '.method li',
      '.method .lead', '.repos li', '.examples li', '.layers li', '.steps li', '.bio-text > *', '.closing', '.next a', '.cv > div',
      '.reach > *', '.chips li', '.stack', '.legal', '.lost > *'];
    const wipe = ['main figure:not(.viewer figure)'];
    const mark = (sel, attr) => document.querySelectorAll(sel).forEach(el => el.setAttribute(attr, ''));
    reveal.forEach(s => mark(s, 'data-reveal'));
    wipe.forEach(s => mark(s, 'data-wipe'));
    const items = [...document.querySelectorAll('[data-reveal],[data-wipe]')];
    // fratelli che entrano insieme partono a cascata, 70 ms l'uno dall'altro
    const io = new IntersectionObserver(entries => {
      const now = entries.filter(e => e.isIntersecting).map(e => e.target);
      now.forEach((el, i) => { el.style.setProperty('--d', Math.min(i * 70, 280) + 'ms'); el.classList.add('in'); io.unobserve(el) });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.documentElement.classList.add('motion');
    items.forEach(el => io.observe(el));
    // riserva: se l'osservatore non scatta (scheda in secondo piano, salto con un'ancora, browser lento)
    // ciò che è già sopra il bordo inferiore dello schermo viene mostrato comunque, per qualche secondo; poi basta l'osservatore.
    let tries = 0;
    const check = () => {
      const pending = items.filter(el => !el.classList.contains('in'));
      pending.forEach(el => { if (el.getBoundingClientRect().top < innerHeight) { el.classList.add('in'); io.unobserve(el) } });
      if (pending.length && ++tries < 6) setTimeout(check, 500);
    };
    setTimeout(check, 600);
  }

  // ---------------------------------------------------------------- tavola: i blocchi entrano quando arrivano sullo schermo
  const works = [...document.querySelectorAll('.board .work')];
  if (!reduced && works.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    document.documentElement.classList.add('board-reveal');
    works.forEach(w => io.observe(w));
    // riserva, come sopra: ciò che è già sullo schermo non resta mai nascosto
    setTimeout(() => works.forEach(w => { if (w.getBoundingClientRect().top < innerHeight) w.classList.add('in') }), 900);
  } else works.forEach(w => w.classList.add('in'));

  // ---------------------------------------------------------------- profondità
  // Le immagini scorrono un poco più lente della pagina; sulla tavola i fogli delle pile si spostano
  // a profondità diverse (--k in lavagna.css) seguendo scorrimento e mouse.
  // Un solo ciclo per fotogramma che scrive e non legge: le posizioni si misurano al caricamento
  // e al ridimensionamento, durante lo scorrimento basta scrollY.
  if (!reduced) {
    const layers = [
      ...[...document.querySelectorAll('.board .work .draw')].map(el => [el, el.closest('.big') ? 0.035 : 0.07]),
      ...[...document.querySelectorAll('.key, .chapter figure, .compare figure, .process figure, .portrait')].map(el => [el, 0.05])
    ];
    const deep = works.length > 0 && matchMedia('(min-width: 1001px)').matches;
    if (layers.length || deep) {
      let at = [], piles = [], mx = 0, my = 0, tx = 0, ty = 0, raf = 0;
      const clamp = (v, m) => Math.max(-m, Math.min(m, v));
      const frame = () => {
        raf = 0;
        const y = scrollY, vh = innerHeight, mid = vh / 2;
        tx += (mx - tx) * 0.08; ty += (my - ty) * 0.08;
        layers.forEach(([el, k], i) => {
          const d = at[i] - y - mid;
          if (Math.abs(d) < vh + 200) el.style.translate = `0 ${clamp(-d * k, 24).toFixed(1)}px`;
        });
        if (deep) works.forEach((w, i) => {
          const [top, bottom] = piles[i];
          if (bottom - y < -100 || top - y > vh + 100) return;
          const s = clamp(((top + bottom) / 2 - y - mid) / vh, 1);
          w.style.setProperty('--px', (tx * 10).toFixed(2) + 'px');
          w.style.setProperty('--py', (ty * 10 - s * 28).toFixed(2) + 'px');
        });
        if (Math.abs(mx - tx) + Math.abs(my - ty) > 0.002) raf = requestAnimationFrame(frame);
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(frame) };
      const measure = () => {
        const y = scrollY;
        layers.forEach(([el]) => el.style.translate = '');
        at = layers.map(([el]) => { const r = el.getBoundingClientRect(); return r.top + y + r.height / 2 });
        piles = works.map(w => { const r = w.getBoundingClientRect(); return [r.top + y, r.bottom + y] });
        kick();
      };
      let pending = 0;
      const remeasure = () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(measure) };
      addEventListener('scroll', kick, { passive: true });
      addEventListener('resize', remeasure);   // anche views.js lo invia quando cambiano vista o filtro
      addEventListener('load', remeasure);
      document.fonts?.ready.then(remeasure);
      if (deep) addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1;
        kick();
      }, { passive: true });
      measure();
    }
  }
})();

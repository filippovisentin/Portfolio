// Movimento del sito: comparsa allo scorrimento, immagini che si scoprono, profondità leggera,
// cursore per mouse e trackpad. Regole e durate in motion.css.
// Con prefers-reduced-motion niente comparse né profondità; il cursore resta ma senza inerzia.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const en = () => document.documentElement.lang === 'en';

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
    // ciò che è già sopra il bordo inferiore dello schermo viene mostrato comunque. Il contenuto non resta mai nascosto.
    const check = () => {
      const pending = items.filter(el => !el.classList.contains('in'));
      pending.forEach(el => { if (el.getBoundingClientRect().top < innerHeight) { el.classList.add('in'); io.unobserve(el) } });
      if (pending.length) setTimeout(check, 400);
    };
    setTimeout(check, 600);
  }

  // ---------------------------------------------------------------- profondità: le immagini scorrono un poco più lente
  if (!reduced) {
    const layers = [
      ...[...document.querySelectorAll('.board .work .draw')].map(el => [el, el.closest('.big') ? 0.035 : 0.07]),
      ...[...document.querySelectorAll('.key, .chapter figure, .compare figure, .process figure, .portrait')].map(el => [el, 0.05])
    ];
    if (layers.length) {
      let ticking = false;
      const update = () => {
        ticking = false;
        const mid = innerHeight / 2;
        for (const [el, k] of layers) {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > innerHeight + 200) continue;
          const y = Math.max(-24, Math.min(24, (r.top + r.height / 2 - mid) * -k));
          el.style.translate = `0 ${y.toFixed(1)}px`;   // translate è separato da transform: non tocca rotazioni e ingrandimenti
        }
      };
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }, { passive: true });
      addEventListener('resize', update);
      update();
    }
  }

  // ---------------------------------------------------------------- cursore: punto preciso + anello che lo segue
  if (fine) {
    const c = document.createElement('div');
    c.className = 'cursor hidden';
    c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<span class="dot"></span><span class="ring"><span></span></span>';
    document.body.append(c);
    document.documentElement.classList.add('has-cursor');
    const dot = c.querySelector('.dot'), ring = c.querySelector('.ring'), label = ring.querySelector('span');
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0;
    const labels = [
      ['.board .work a', ['Apri', 'Open']], ['.atlas .zoom', ['Zoom', 'Zoom']], ['.try canvas', ['Ruota', 'Rotate']],
      ['video', ['Play', 'Play']], ['.viewer img', ['Chiudi', 'Close']]
    ];
    const loop = () => {
      rx += (x - rx) * 0.22; ry += (y - ry) * 0.22;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px)`;
      if (reduced) { rx = x; ry = y; ring.style.transform = `translate(${x}px, ${y}px)` }
      else if (!raf) raf = requestAnimationFrame(loop);
      c.classList.remove('hidden');
      const t = e.target.closest ? e.target : null;
      const hit = t && labels.find(([s]) => t.closest(s));
      const text = t && t.closest('input, textarea, [contenteditable]');
      c.classList.toggle('label', !!hit && !text);
      c.classList.toggle('link', !hit && !text && !!(t && t.closest('a[href], button, [data-shot], summary, label')));
      c.classList.toggle('text', !!text);
      label.textContent = hit ? hit[1][en() ? 1 : 0] : '';
    }, { passive: true });
    addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') c.classList.add('down') });
    addEventListener('pointerup', () => c.classList.remove('down'));
    document.addEventListener('pointerleave', () => c.classList.add('hidden'));
    // il visore dell'atlante è uno strato superiore: il cursore deve stargli sopra
    document.querySelectorAll('dialog').forEach(d => {
      d.addEventListener('toggle', () => d.open ? d.append(c) : document.body.append(c));
      new MutationObserver(() => (d.open ? d.append(c) : document.body.append(c))).observe(d, { attributes: true, attributeFilter: ['open'] });
    });
  }
})();

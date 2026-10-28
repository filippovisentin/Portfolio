// Tema chiaro o negativo. Caricato in <head> senza defer, così la pagina non lampeggia nel tema sbagliato.
// La scelta si chiede una volta, sulla home, appena finisce l'apertura (evento "introend" da intro.js);
// poi un pulsante accanto alla lingua la cambia. Stili in theme.css.
(() => {
  const KEY = 'fav-theme', root = document.documentElement;
  let theme = null;
  try { theme = localStorage.getItem(KEY) } catch {}
  if (theme === 'dark') root.dataset.theme = 'dark';
  const it = () => root.lang !== 'en';
  let btn;

  const label = () => {
    if (!btn) return;
    const dark = root.dataset.theme === 'dark';
    btn.setAttribute('aria-pressed', String(dark));
    btn.setAttribute('aria-label', it()
      ? (dark ? 'Tema negativo — passa al chiaro' : 'Tema chiaro — passa al negativo')
      : (dark ? 'Negative theme — switch to light' : 'Light theme — switch to negative'));
  };
  const set = t => {
    theme = t;
    if (t === 'dark') root.dataset.theme = 'dark'; else delete root.dataset.theme;
    try { localStorage.setItem(KEY, t) } catch {}
    label();
  };

  const ask = () => {
    const box = document.createElement('div');
    box.className = 'theme-ask';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', 'ta-q');
    const [q, dark, light] = it() ? ['Come vuoi vedere la tavola?', 'Negativo', 'Chiaro'] : ['How would you like to see the board?', 'Negative', 'Light'];
    box.innerHTML = `<p class="ta-q" id="ta-q">${q}</p><div class="ta-opts">
      <button type="button" data-t="dark"><i></i><span>${dark}</span></button>
      <button type="button" data-t="light"><i></i><span>${light}</span></button></div>`;
    document.body.append(box);
    const opts = [...box.querySelectorAll('button')];
    // anteprima: la pagina prende il tema della scelta sotto il puntatore o il fuoco, e torna al chiaro se non si sceglie
    let done = false;
    const preview = t => { if (done) return; if (t === 'dark') root.dataset.theme = 'dark'; else delete root.dataset.theme };
    const close = t => {
      preview(t);
      done = true;   // mentre il riquadro sparisce il puntatore "esce" dai quadrati: l'anteprima non deve più cambiare nulla
      if (t) set(t);
      box.classList.add('out');
      setTimeout(() => box.remove(), 350);
      removeEventListener('keydown', keys, true);
      btn?.focus({ preventScroll: true });
    };
    // Esc chiude senza scegliere (resta il chiaro, e la domanda torna alla prossima visita); Tab resta tra i due quadrati
    const keys = e => {
      if (e.key === 'Escape') { e.preventDefault(); close() }
      else if (e.key === 'Tab') { e.preventDefault(); opts[(opts.indexOf(document.activeElement) + 1) % 2].focus() }
    };
    opts.forEach(o => {
      o.addEventListener('click', () => close(o.dataset.t));
      o.addEventListener('pointerenter', () => preview(o.dataset.t));
      o.addEventListener('focus', () => preview(o.dataset.t));
    });
    box.querySelector('.ta-opts').addEventListener('pointerleave', () => preview(document.activeElement?.closest?.('.theme-ask') ? document.activeElement.dataset.t : null));
    addEventListener('keydown', keys, true);
  };

  // coordinate accanto al mirino, come la riga di stato di un CAD: solo con il mouse.
  // Un solo aggiornamento per fotogramma, e solo transform e testo: niente ricalcolo della pagina.
  const coords = () => {
    if (!matchMedia('(pointer: fine)').matches) return;
    const tag = document.createElement('span');
    tag.className = 'coords';
    tag.setAttribute('aria-hidden', 'true');
    document.body.append(tag);
    const pad = v => String(Math.max(0, Math.round(v))).padStart(4, '0');
    let x = 0, y = 0, raf = 0;
    const draw = () => {
      raf = 0;
      tag.textContent = `X ${pad(x)} · Y ${pad(y + scrollY)}`;
      const flip = x > innerWidth - 150, down = y > innerHeight - 40;   // vicino ai bordi l'etichetta passa dall'altra parte
      tag.style.transform = `translate(${flip ? x - 12 - tag.offsetWidth : x + 12}px,${down ? y - 22 : y + 12}px)`;
    };
    const ask = () => { raf ||= requestAnimationFrame(draw) };
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      tag.classList.add('on');
      ask();
    }, { passive: true });
    addEventListener('scroll', ask, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => tag.classList.remove('on'));
  };

  addEventListener('DOMContentLoaded', () => {
    const lang = document.querySelector('#language');
    if (lang) {
      btn = document.createElement('button');
      btn.id = 'theme';
      btn.type = 'button';
      btn.innerHTML = '<i></i>';
      lang.before(btn);
      btn.addEventListener('click', () => set(root.dataset.theme === 'dark' ? 'light' : 'dark'));
      addEventListener('langchange', label);
      label();
    }
    coords();
    if (theme || !document.querySelector('.board')) return;
    if (root.classList.contains('intro')) addEventListener('introend', ask, { once: true });
    else ask();
  });
})();

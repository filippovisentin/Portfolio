// Apertura della tavola: torri su una griglia in prospettiva, poi la vista si appiattisce e il foglio si alza.
// Caricato in <head> senza defer, così la tavola non lampeggia prima dell'apertura. Stili in intro.css.
// Una volta per sessione; mai con prefers-reduced-motion; un clic o un tasto la salta.
(() => {
  const KEY = 'fav-intro';
  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1' } catch {}
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try { sessionStorage.setItem(KEY, '1') } catch {}
  const root = document.documentElement;
  root.classList.add('intro');
  // riserva: qualunque cosa accada, la pagina non resta nascosta
  // a fine apertura la pagina si mostra e theme.js può chiedere il tema ("introend")
  const reveal = () => { if (root.classList.contains('intro')) { root.classList.remove('intro'); dispatchEvent(new Event('introend')) } };
  const failsafe = setTimeout(reveal, 7000);

  addEventListener('DOMContentLoaded', () => {
    const it = root.lang !== 'en';
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.setAttribute('aria-hidden', 'true');
    loader.innerHTML = `<div class="ld-stage"><div class="ld-plane"></div></div><div class="ld-dimline"></div>
      <p class="ld-name"><span><i>Filippo Antonio</i></span><span><i><b>Visentin</b></i></span></p>
      <span class="ld-dim">← Product &amp; interior design · Computational design · ${it ? 'Prototipazione' : 'Prototyping'} →</span>
      <span class="ld-skip">${it ? 'Clic per saltare' : 'Click to skip'}</span>
      <span class="ld-coords">X 0000 · Y 0000 · 1:100</span>
      <div class="ld-foot"><span>Politecnico di Milano<br>Portfolio 2026</span><span class="ld-count">000</span></div>`;
    document.body.prepend(loader);

    // griglia: verticali ogni 10%, orizzontali ogni 12,5%, due guide attorno al nome
    const plane = loader.querySelector('.ld-plane'), cells = [];
    let html = '', k = 0;
    for (let x = 10; x <= 90; x += 10) html += `<i class="v" style="--x:${x}%;--i:${k++}"></i>`;
    for (let y = 12.5; y < 100; y += 12.5) html += `<i class="h" style="--y:${y}%;--i:${k++}"></i>`;
    html += `<i class="h a top" style="--i:${k++}"></i><i class="h a bot" style="--i:${k++}"></i>`;
    // torri a onda diagonale; altezze da una sinusoide; una fascia libera dietro al nome
    const phone = innerWidth < 700;
    const cw = plane.clientWidth / 10, ch = plane.clientHeight / 8, m = cw * .12;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 10; c++) {
      if ((r >= (phone ? 2 : 3) && r <= (phone ? 5 : 4) && c >= 1 && c <= 8) || Math.random() < (phone ? .6 : .5)) continue;
      const tone = Math.random() < .22 ? ' k' : '';
      cells.push(`<div class="bld${tone}" style="left:${c * cw + m}px;top:${r * ch + m}px;width:${cw - 2 * m}px;height:${ch - 2 * m}px;--h:${40 + 220 * (.5 + .5 * Math.sin(c * .7 + r * .9))}px;--dl:${(c + r) * 70}ms"><b class="sh"></b><b class="rf"></b><b class="n"></b><b class="s"></b><b class="w"></b><b class="e"></b></div>`);
    }
    plane.innerHTML = html + cells.join('');
    requestAnimationFrame(() => requestAnimationFrame(() => loader.classList.add('draw')));

    // il contatore segue le prime immagini della tavola, ma non è mai più corto del disegno
    const n = loader.querySelector('.ld-count'), coords = loader.querySelector('.ld-coords');
    const imgs = [...document.querySelectorAll('.board img.line')].slice(0, 4), t0 = performance.now();
    let loaded = 0, done = false;
    const total = Math.max(1, imgs.length);
    imgs.forEach(im => { if (im.complete) loaded++; else { const f = () => loaded++; im.addEventListener('load', f, { once: true }); im.addEventListener('error', f, { once: true }) } });

    const finish = fast => {
      if (done) return;
      done = true;
      n.textContent = '100';
      loader.classList.add('set');
      setTimeout(() => {
        loader.classList.add('out');
        reveal();
        clearTimeout(failsafe);
      }, fast ? 150 : 650);
      setTimeout(() => loader.remove(), fast ? 1100 : 1700);
    };
    const tick = now => {
      if (done) return;
      const time = Math.min(1, (now - t0) / 2400), p = Math.min(1, Math.min(loaded / total, time) * .6 + time * .4), e = 1 - Math.pow(1 - p, 3);
      n.textContent = String(Math.round(e * 100)).padStart(3, '0');
      coords.textContent = `X ${String(Math.round(e * 1440)).padStart(4, '0')} · Y ${String(Math.round(e * 900)).padStart(4, '0')} · 1:${Math.round(100 - e * 99)}`;
      if (p < 1 && now - t0 < 5000) return requestAnimationFrame(tick);
      finish(false);
    };
    requestAnimationFrame(tick);
    loader.addEventListener('click', () => finish(true));
    addEventListener('keydown', () => finish(true), { once: true });
  });
})();

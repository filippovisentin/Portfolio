// Filo tratteggiato che collega i progetti nell'ordine 01 → 07, passando sotto i disegni.
// Solo decorativo: senza JavaScript la tavola resta completa.
(() => {
  const board = document.querySelector('.board');
  if (!board) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'thread');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  svg.append(path);
  board.prepend(svg);

  const draw = () => {
    if (getComputedStyle(svg).display === 'none') return;
    const b = board.getBoundingClientRect();
    // centro di ogni disegno, ignorando la rotazione (offset* non la considera)
    const pts = [...board.querySelectorAll('.work')].filter(w => w.querySelector('.draw')).map(w => {
      const d = w.querySelector('.draw');
      return [w.offsetLeft + d.offsetLeft + d.offsetWidth / 2, w.offsetTop + d.offsetTop + d.offsetHeight / 2];
    });
    svg.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`);
    // curva morbida: Catmull-Rom convertita in Bézier
    let d = `M${pts[0]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1} ${c2} ${p2}`;
    }
    path.setAttribute('d', d);
  };

  addEventListener('load', draw);
  new ResizeObserver(draw).observe(board);
})();

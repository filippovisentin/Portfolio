// FORMA — una piccola vista di prova nella pagina: riga di comando in stile Rhino,
// modello in centimetri, assonometria ruotabile. È una dimostrazione: nulla viene salvato.
// Senza JavaScript la pagina mostra la sequenza di comandi come elenco e le schermate dell'app.
(() => {
  const root = document.querySelector('.try');
  if (!root) return;
  const en = () => document.documentElement.lang === 'en';
  const T = (it, eng) => (en() ? eng : it);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const form = root.querySelector('form');
  const input = root.querySelector('input');
  const log = root.querySelector('.log');
  const status = root.querySelector('.status-bar');
  const chips = [...root.querySelectorAll('[data-cmd]')];
  root.hidden = false;
  document.querySelector('.try-fallback')?.remove();

  // ---------------------------------------------------------------- modello
  let objects = [];          // {kind:'curve'|'walls'|'box', ...}
  let history = [];          // stati precedenti, per Undo
  let yaw = -0.62, pitch = 0.6;
  const snapshot = () => history.push(JSON.stringify(objects));
  const selected = () => objects.filter(o => o.sel);
  const nums = s => s.split(/[\s,]+/).filter(Boolean).map(Number);
  const objs = n => T(n === 1 ? '1 oggetto' : `${n} oggetti`, n === 1 ? '1 object' : `${n} objects`);

  const describe = o => o.kind === 'curve' ? T(`rettangolo ${o.w} × ${o.d} cm`, `${o.w} × ${o.d} cm rectangle`)
    : o.kind === 'walls' ? T(`muri alti ${o.h} cm su ${o.w} × ${o.d}`, `${o.h} cm walls on ${o.w} × ${o.d}`)
    : T(`parallelepipedo ${o.w} × ${o.d} × ${o.h} cm`, `${o.w} × ${o.d} × ${o.h} cm box`);

  const commands = {
    rectangle(a) {
      const [x0, y0, x1, y1] = nums(a);
      if ([x0, y0, x1, y1].some(Number.isNaN) || x1 === undefined) return T('Uso: Rectangle x,y x,y', 'Usage: Rectangle x,y x,y');
      snapshot(); objects.forEach(o => o.sel = false);
      objects.push({ kind: 'curve', x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), d: Math.abs(y1 - y0), h: 0 });
      return T(`Creato un rettangolo ${Math.abs(x1 - x0)} × ${Math.abs(y1 - y0)} cm.`, `Created a ${Math.abs(x1 - x0)} × ${Math.abs(y1 - y0)} cm rectangle.`);
    },
    sellast() {
      if (!objects.length) return T('Nessun oggetto da selezionare.', 'Nothing to select.');
      objects.forEach(o => o.sel = false); objects.at(-1).sel = true;
      return T(`Selezionato: ${describe(objects.at(-1))}.`, `Selected: ${describe(objects.at(-1))}.`);
    },
    selall() { objects.forEach(o => o.sel = true); return T(`Selezionati: ${objs(objects.length)}.`, `Selected: ${objs(objects.length)}.`) },
    selnone() { objects.forEach(o => o.sel = false); return T('Selezione annullata.', 'Selection cleared.') },
    extrude(a) {
      const h = nums(a)[0];
      const target = selected().filter(o => o.kind === 'curve');
      if (!target.length) return T('Seleziona prima una curva (SelLast).', 'Select a curve first (SelLast).');
      if (!(h > 0)) return T('Uso: Extrude altezza', 'Usage: Extrude height');
      snapshot(); target.forEach(o => { o.kind = 'walls'; o.h = h });
      return T(`Estrusi ${target.length === 1 ? 'i muri' : target.length + ' contorni'}: ${h} cm.`, `Extruded ${target.length === 1 ? 'the walls' : target.length + ' outlines'}: ${h} cm.`);
    },
    box(a) {
      const [x0, y0, x1, y1, h] = nums(a);
      if ([x0, y0, x1, y1, h].some(v => v === undefined || Number.isNaN(v))) return T('Uso: Box x,y x,y altezza', 'Usage: Box x,y x,y height');
      snapshot(); objects.forEach(o => o.sel = false);
      objects.push({ kind: 'box', x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), d: Math.abs(y1 - y0), h, sel: true });
      return T(`Creato un parallelepipedo ${Math.abs(x1 - x0)} × ${Math.abs(y1 - y0)} × ${h} cm.`, `Created a ${Math.abs(x1 - x0)} × ${Math.abs(y1 - y0)} × ${h} cm box.`);
    },
    move(a) {
      const [dx, dy, dz = 0] = nums(a);
      if ([dx, dy].some(v => v === undefined || Number.isNaN(v))) return T('Uso: Move dx,dy', 'Usage: Move dx,dy');
      if (!selected().length) return T('Seleziona prima un oggetto.', 'Select an object first.');
      snapshot(); selected().forEach(o => { o.x += dx; o.y += dy; o.z = (o.z || 0) + dz });
      return T(`Spostati: ${objs(selected().length)}.`, `Moved: ${objs(selected().length)}.`);
    },
    delete() {
      if (!selected().length) return T('Nessun oggetto selezionato.', 'Nothing selected.');
      snapshot(); const n = selected().length; objects = objects.filter(o => !o.sel);
      return T(`Eliminati: ${objs(n)}.`, `Deleted: ${objs(n)}.`);
    },
    undo() {
      if (!history.length) return T('Niente da annullare.', 'Nothing to undo.');
      objects = JSON.parse(history.pop()); return T('Annullato.', 'Undone.');
    },
    new() { snapshot(); objects = []; return T('Nuovo modello vuoto.', 'New empty model.') },
    save(a) {
      const name = a.trim() || 'senza-titolo.3dm';
      return T(`In Forma questo salverebbe «${name}» in formato Rhino (.3dm). Qui è una prova: non viene scaricato nulla.`,
        `In Forma this would save “${name}” in Rhino format (.3dm). This is a demo: nothing is downloaded.`);
    },
    help() {
      return T('Comandi: Rectangle, SelLast, SelAll, SelNone, Extrude, Box, Move, Delete, Undo, New, Save. Trascina la vista per ruotarla.',
        'Commands: Rectangle, SelLast, SelAll, SelNone, Extrude, Box, Move, Delete, Undo, New, Save. Drag the view to rotate it.');
    }
  };

  const run = line => {
    const text = line.trim();
    if (!text) return;
    const [name, ...rest] = text.split(/\s+/);
    const fn = commands[name.toLowerCase()];
    const chip = chips.find(c => c.dataset.cmd.toLowerCase() === text.toLowerCase());
    const reply = fn ? fn(rest.join(' ')) : T(`Comando sconosciuto: ${name}. Prova Help.`, `Unknown command: ${name}. Try Help.`);
    const li = document.createElement('li');
    const cmd = document.createElement('code'); cmd.textContent = '› ' + text;
    const out = document.createElement('span'); out.textContent = reply + (chip ? ' — ' + (en() ? chip.dataset.enDesc : chip.dataset.itDesc) : '');
    li.append(cmd, out); log.append(li);
    while (log.children.length > 6) log.firstElementChild.remove();
    chips.forEach(c => c.classList.toggle('done', c.dataset.cmd.toLowerCase() === text.toLowerCase() || c.classList.contains('done')));
    draw();
  };

  // ---------------------------------------------------------------- disegno
  const faces = o => {
    const z0 = o.z || 0, z1 = z0 + o.h, { x, y, w, d } = o;
    const p = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
    const side = p.map((a, i) => { const b = p[(i + 1) % 4]; return [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]] });
    if (o.kind === 'curve') return [{ pts: p.map(([a, b]) => [a, b, z0]), open: true }];
    if (o.kind === 'walls') return side.map(pts => ({ pts }));
    return [...side.map(pts => ({ pts })), { pts: p.map(([a, b]) => [a, b, z1]) }];
  };

  const draw = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = canvas.clientWidth, H = canvas.clientHeight;
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr) }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const view = ([x, y, z]) => { const rx = x * cy - y * sy, ry = x * sy + y * cy; return [rx, -ry * sp - z * cp, ry * cp - z * sp] };

    // inquadratura: griglia di 8 × 6 m più tutti gli oggetti
    let pts = [[0, 0, 0], [800, 0, 0], [800, 600, 0], [0, 600, 0], [0, 0, 300]];
    objects.forEach(o => faces(o).forEach(f => pts.push(...f.pts)));
    const v = pts.map(view);
    const minX = Math.min(...v.map(p => p[0])), maxX = Math.max(...v.map(p => p[0]));
    const minY = Math.min(...v.map(p => p[1])), maxY = Math.max(...v.map(p => p[1]));
    const s = Math.min((W - 48) / (maxX - minX), (H - 48) / (maxY - minY));
    const ox = (W - (maxX - minX) * s) / 2 - minX * s, oy = (H - (maxY - minY) * s) / 2 - minY * s;
    const P = q => { const r = view(q); return [ox + r[0] * s, oy + r[1] * s, r[2]] };
    const line = (a, b) => { const A = P(a), B = P(b); ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke() };

    // griglia ogni metro, assi più scuri
    ctx.lineWidth = 1;
    for (let i = 0; i <= 800; i += 100) { ctx.strokeStyle = i ? '#e4e4e4' : '#9a9a9a'; line([i, 0, 0], [i, 600, 0]) }
    for (let j = 0; j <= 600; j += 100) { ctx.strokeStyle = j ? '#e4e4e4' : '#9a9a9a'; line([0, j, 0], [800, j, 0]) }

    // facce ordinate per profondità: bianche con bordo nero (linee nascoste), la selezione in lime
    const all = [];
    objects.forEach(o => faces(o).forEach(f => all.push({ ...f, sel: o.sel, depth: f.pts.reduce((m, q) => m + view(q)[2], 0) / f.pts.length })));
    all.sort((a, b) => b.depth - a.depth);
    for (const f of all) {
      const q = f.pts.map(P);
      ctx.beginPath(); q.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      if (!f.open) { ctx.closePath(); ctx.fillStyle = f.sel ? '#d4ff3a' : '#ffffff'; ctx.fill() }
      else ctx.closePath();
      ctx.strokeStyle = '#111'; ctx.lineWidth = f.sel ? 2 : 1.25; ctx.stroke();
    }

    // gumball sull'ultimo oggetto selezionato
    const g = selected().at(-1);
    if (g) {
      const c = [g.x + g.w / 2, g.y + g.d / 2, (g.z || 0) + g.h / 2], L = 90;
      ctx.lineWidth = 2; ctx.font = '11px "Courier Prime", monospace'; ctx.fillStyle = '#111';
      [[[L, 0, 0], 'X'], [[0, L, 0], 'Y'], [[0, 0, L], 'Z']].forEach(([d, t]) => {
        const e = [c[0] + d[0], c[1] + d[1], c[2] + d[2]]; ctx.strokeStyle = '#111'; line(c, e);
        const E = P(e); ctx.beginPath(); ctx.arc(E[0], E[1], 3, 0, 7); ctx.fill(); ctx.fillText(t, E[0] + 6, E[1] - 4);
      });
    }

    const list = objects.map(describe).join('; ');
    const label = objects.length
      ? T(`Vista 3D di Forma: ${list}.`, `Forma 3D view: ${list}.`)
      : T('Vista 3D di Forma: griglia vuota di 8 × 6 metri.', 'Forma 3D view: empty 8 × 6 metre grid.');
    if (canvas.getAttribute('aria-label') !== label) canvas.setAttribute('aria-label', label);
    const text = T(`Oggetti ${objects.length} · selezionati ${selected().length} · unità cm`, `Objects ${objects.length} · selected ${selected().length} · units cm`);
    if (status.textContent !== text) status.textContent = text;
  };
  // trascinando arrivano più eventi che fotogrammi: si disegna una volta per fotogramma
  let frame = 0;
  const redraw = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; draw() }) };

  // ---------------------------------------------------------------- interazione
  form.addEventListener('submit', e => { e.preventDefault(); run(input.value); input.value = '' });
  chips.forEach(c => c.addEventListener('click', () => { run(c.dataset.cmd); input.focus({ preventScroll: true }) }));

  // la sequenza della demo: digitata lettera per lettera, o subito con il movimento ridotto
  let playing = false;
  const play = root.querySelector('.play');   // dopo un await e.currentTarget non vale più: si usa il riferimento diretto
  play.addEventListener('click', async () => {
    if (playing) return; playing = true; play.disabled = true;
    commands.new(); log.replaceChildren(); chips.forEach(c => c.classList.remove('done')); draw();
    for (const c of chips) {
      if (!reduced.matches) for (let i = 0; i <= c.dataset.cmd.length; i++) { input.value = c.dataset.cmd.slice(0, i); await new Promise(r => setTimeout(r, 38)) }
      input.value = ''; run(c.dataset.cmd);
      await new Promise(r => setTimeout(r, reduced.matches ? 0 : 520));
    }
    playing = false; play.disabled = false;
  });
  root.querySelector('.reset').addEventListener('click', () => { objects = []; history = []; log.replaceChildren(); chips.forEach(c => c.classList.remove('done')); draw() });

  // rotazione: trascinamento, frecce sulla vista, pulsanti
  let drag = null;
  canvas.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY, yaw, pitch]; canvas.setPointerCapture(e.pointerId) });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    yaw = drag[2] + (e.clientX - drag[0]) * 0.01;
    pitch = Math.max(0.12, Math.min(1.45, drag[3] + (e.clientY - drag[1]) * 0.006));
    redraw();
  });
  canvas.addEventListener('pointerup', () => drag = null);
  canvas.addEventListener('keydown', e => {
    const k = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] }[e.key];
    if (!k) return; e.preventDefault(); yaw += k[0]; pitch = Math.max(0.12, Math.min(1.45, pitch + k[1])); draw();
  });
  root.querySelectorAll('[data-orbit]').forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.orbit;
    if (v === 'top') { yaw = 0; pitch = 1.45 } else if (v === 'iso') { yaw = -0.62; pitch = 0.6 } else yaw += Number(v);
    draw();
  }));
  new ResizeObserver(redraw).observe(canvas);
  addEventListener('langchange', draw);
  draw();

  // ---------------------------------------------------------------- schermate dell'app
  const shots = document.querySelector('.shots');
  if (shots) {
    const tabs = [...shots.querySelectorAll('[data-shot]')];
    const figs = [...shots.querySelectorAll('figure')];
    shots.classList.add('js');
    const show = i => {
      tabs.forEach((t, j) => t.setAttribute('aria-pressed', String(i === j)));
      figs.forEach((f, j) => f.hidden = i !== j);
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => show(i)));
    show(0);
  }

  // ---------------------------------------------------------------- architettura: gli strati si evidenziano insieme alla descrizione
  document.querySelectorAll('.layers li').forEach(li => {
    li.tabIndex = 0;
    const on = () => li.parentElement.querySelectorAll('li').forEach(x => x.classList.toggle('on', x === li));
    li.addEventListener('pointerenter', on); li.addEventListener('focus', on);
  });
})();

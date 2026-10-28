// Italiano / inglese per le pagine della lavagna, con lo stesso schema e la stessa
// preferenza salvata di app.js (data-it / data-en, chiave "portfolio-language").
(() => {
  let lang = (navigator.language || 'it').toLowerCase().startsWith('it') ? 'it' : 'en';
  try { lang = localStorage.getItem('portfolio-language') || lang } catch {}
  if (!['it', 'en'].includes(lang)) lang = 'it';

  // **parola** nel testo diventa <strong class="hl">: le parole chiave restano in grassetto in entrambe le lingue.
  // Nodi costruiti uno per uno, mai innerHTML.
  const put = (e, s) => {
    if (!s.includes('**')) { e.textContent = s; return }
    e.replaceChildren(...s.split(/\*\*(.+?)\*\*/).map((part, i) => {
      if (i % 2 === 0) return document.createTextNode(part);
      const b = document.createElement('strong');
      b.className = 'hl';
      b.textContent = part;
      return b;
    }));
  };

  const apply = () => {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-it][data-en]').forEach(e => put(e, e.dataset[lang]));
    document.querySelectorAll('[data-it-alt]').forEach(e => { e.alt = lang === 'it' ? e.dataset.itAlt : e.dataset.enAlt });
    document.querySelectorAll('[data-it-label]').forEach(e => e.setAttribute('aria-label', lang === 'it' ? e.dataset.itLabel : e.dataset.enLabel));
    const b = document.querySelector('#language');
    if (b) {
      b.textContent = lang === 'it' ? 'EN' : 'IT';
      b.setAttribute('aria-label', lang === 'it' ? 'EN — Switch to English' : 'IT — Passa a italiano');
    }
    dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  };

  document.querySelector('#language')?.addEventListener('click', () => {
    lang = lang === 'it' ? 'en' : 'it';
    try { localStorage.setItem('portfolio-language', lang) } catch {}
    apply();
  });
  apply();
})();

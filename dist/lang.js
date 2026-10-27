// Italiano / inglese per le pagine della lavagna, con lo stesso schema e la stessa
// preferenza salvata di app.js (data-it / data-en, chiave "portfolio-language").
(() => {
  let lang = (navigator.language || 'it').toLowerCase().startsWith('it') ? 'it' : 'en';
  try { lang = localStorage.getItem('portfolio-language') || lang } catch {}
  if (!['it', 'en'].includes(lang)) lang = 'it';

  const apply = () => {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-it][data-en]').forEach(e => { e.textContent = e.dataset[lang] });
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

// Info / Contatti: copia dell'indirizzo email, con conferma annunciata.
(() => {
  const b = document.querySelector('.copy');
  const out = document.querySelector('.copied');
  if (!b) return;
  const en = () => document.documentElement.lang === 'en';
  b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.email);
      b.classList.add('ok');
      out.textContent = en() ? 'Address copied' : 'Indirizzo copiato';
    } catch {
      out.textContent = en() ? 'Copy failed: select the address above' : 'Copia non riuscita: seleziona l’indirizzo qui sopra';
    }
    setTimeout(() => { b.classList.remove('ok'); out.textContent = '' }, 2600);
  });
})();

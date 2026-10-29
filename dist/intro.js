// Apertura semitrasparente, una volta per sessione.
// theme.js mostra nome e scelta del tema nello stesso dialogo; intro.css ne cura l'ingresso.
(() => {
  let seen = false;
  try { seen = sessionStorage.getItem('fav-intro') === '1' } catch {}
  if (seen) return;
  try { sessionStorage.setItem('fav-intro', '1') } catch {}
  const root = document.documentElement;
  root.classList.add('intro');
  // Se il dialogo non viene creato, la home resta comunque accessibile.
  setTimeout(() => {
    if (root.classList.contains('intro') && !document.querySelector('.intro-gate')) {
      root.classList.remove('intro');
      dispatchEvent(new Event('introend'));
    }
  }, 7000);
})();

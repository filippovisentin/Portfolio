// An explanatory walkthrough: it does not upload photos or run the app's image pipeline.
(() => {
  const root = document.querySelector('[data-ms-process]');
  if (!root) return;
  const buttons = [...root.querySelectorAll('[data-ms-step]')];
  const figures = [...root.querySelectorAll('[data-ms-figure]')];
  const caption = root.querySelector('[data-ms-caption]');
  const count = root.querySelector('[data-ms-count]');
  const conversion = root.querySelector('[data-ms-conversion]');
  const captions = [
    ['Schema esplicativo · scatto', 'Explanatory diagram · capture'],
    ['Schermata reale · riferimento', 'Actual app screen · reference'],
    ['Schema esplicativo · rettifica', 'Explanatory diagram · rectification'],
    ['Schema esplicativo · contorno', 'Explanatory diagram · outline'],
    ['Schermata reale · misure', 'Actual app screen · measurements'],
    ['Schermata reale · catalogo locale', 'Actual app screen · local catalogue'],
  ];
  const select = index => {
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    figures.forEach((figure, i) => { figure.hidden = i !== index });
    const [it, en] = captions[index];
    caption.dataset.it = it;
    caption.dataset.en = en;
    caption.textContent = document.documentElement.lang === 'en' ? en : it;
    count.textContent = String(index + 1).padStart(2, '0') + ' / 06';
    conversion.hidden = index !== 4;
    const zone = index < 2 ? 'capture' : index < 5 ? 'analysis' : 'catalogue';
    root.querySelectorAll('[data-ms-zone]').forEach(element => element.classList.toggle('is-current', element.dataset.msZone === zone));
  };
  buttons.forEach((button, index) => button.addEventListener('click', () => select(index)));
  select(0);
})();

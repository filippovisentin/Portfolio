// Native links preserve shareable project URLs and browser back/forward.
(() => {
  const project = document.querySelector('#progetto');
  if (!project) return;
  const current = document.body.dataset.app;
  const update = () => {
    const selected = Boolean(location.hash);
    project.hidden = !selected;
    document.querySelectorAll('[data-app-choice]').forEach(link => {
      if (selected && link.dataset.appChoice === current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (selected && location.hash === '#progetto') {
      const heading = project.querySelector('h2');
      heading.focus({ preventScroll: true });
      project.scrollIntoView({ block: 'start' });
    }
  };
  window.addEventListener('hashchange', update);
  update();
})();

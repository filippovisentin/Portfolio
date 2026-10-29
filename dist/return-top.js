// Keep the current project selection and URL while moving focus back to the header.
document.querySelectorAll('[data-return-top]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const top = document.getElementById('inizio');
    if (!top) return;
    event.preventDefault();
    top.focus({ preventScroll: true });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
});

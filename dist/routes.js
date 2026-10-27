// Vecchi indirizzi del portfolio (#home, #index, #<progetto>, #code, #about) verso le pagine della lavagna.
// Caricato senza defer, prima del disegno della pagina, così il reindirizzamento non lampeggia;
// ascolta anche il cambio di hash, per i link che cambiano solo il frammento.
(() => {
  const projects = ['monoblock', 'bivacuum', 'oltreetrusco', 'poliedro', 'compluvio', 'presence', 'soundplace'];
  const route = () => {
    const h = location.hash.slice(1);
    if (!h || h === 'main' || h === 'tavola' || h === 'indice') return;
    if (h === 'home') history.replaceState(null, '', location.pathname + location.search);
    else if (h === 'index') location.replace('index.html?vista=indice');
    else if (h === 'code') location.replace('forma.html');
    else if (h === 'about') location.replace('info.html');
    else if (projects.includes(h)) location.replace(h + '.html');
  };
  route();
  addEventListener('hashchange', route);
})();

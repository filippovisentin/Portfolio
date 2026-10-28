# Sicurezza / Security

## Segnalare un problema

Se trovi una vulnerabilità nel sito, scrivi a filippoantonio.visentin@mail.polimi.it con oggetto "Security — Portfolio", descrivendo il problema e come riprodurlo. Non aprire una issue pubblica prima di una risposta. Riceverai un riscontro entro 7 giorni.

## Reporting a vulnerability

If you find a vulnerability in this site, email filippoantonio.visentin@mail.polimi.it with the subject "Security — Portfolio", describing the issue and how to reproduce it. Please do not open a public issue until you have had a reply. You will get an answer within 7 days.

## Come è protetto il sito / How the site is protected

- Sito statico: nessun server applicativo, nessun database, nessun modulo, nessun cookie, nessun tracciamento.
- Nel browser restano solo preferenze tecniche, mai inviate: lingua e tema (`localStorage`: `portfolio-language`, `fav-theme`), vista della tavola e apertura già vista (`sessionStorage`). Informativa completa in Info → Privacy e cookie (`info.html#privacy`).
- Nessuna dipendenza di terze parti: script, font, immagini e video sono serviti dallo stesso dominio.
- Content Security Policy restrittiva (`<meta>` in ogni pagina di `dist/`; header completi in `dist/_headers` per Cloudflare Pages o Netlify): solo script dello stesso dominio, niente plugin, niente form, niente `<base>` esterno.
- HTTPS obbligatorio con HSTS (GitHub Pages).
- Link esterni aperti con `rel="noopener noreferrer"`.
- Il testo inserito nelle pagine passa per una funzione di escape; i contenuti vengono solo da `dist/data.js`, nel repository.
- Il workflow di pubblicazione ha permessi minimi (`contents: read`, `pages: write`, `id-token: write`) e non conserva credenziali git.
- `npm run check` blocca script o fogli di stile esterni, `eval`/`new Function` e l'assenza della Content Security Policy.

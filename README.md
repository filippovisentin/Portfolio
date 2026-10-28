# Filippo Antonio Visentin — Portfolio

Portfolio bilingue IT/EN di un designer di prodotto e d'interni (Politecnico di Milano): sette progetti su una tavola, la pagina Codice dedicata a Forma, bio con CV scaricabile. HTML, CSS e JavaScript senza dipendenze, senza tracciamento e senza servizi esterni.

**Sito:** https://filippovisentin.pages.dev/ (Cloudflare Pages, principale) · copia su https://filippovisentin.github.io/Portfolio/ (GitHub Pages)

## Avvio

Con Node.js 20+:

```bash
npm run dev
```

Poi aprire http://127.0.0.1:4173. Il server locale invia gli stessi header di sicurezza del sito pubblico.

```bash
npm run check
```

Verifica la sintassi di tutti gli script e l'integrità del sito su ogni pagina: immagini uniche, nessun file mancante o inutilizzato, traduzioni complete, CSP, nessuno script inline o di terze parti, link esterni sicuri.

Ogni pagina carica fogli di stile e script con `?v=<versione>` (per esempio `pages.css?v=5.3.0`). GitHub Pages li fa tenere in cache per 10 minuti: a ogni nuova versione aggiornare il numero in tutti i file HTML, così chi torna sul sito riceve subito gli stili nuovi.

## Struttura

| File | Contenuto |
| --- | --- |
| `dist/index.html` | La tavola dei sette progetti e l'indice con i filtri |
| `dist/<progetto>.html` | Un caso studio per progetto: `monoblock`, `bivacuum`, `oltreetrusco`, `poliedro`, `compluvio`, `presence`, `soundplace` |
| `dist/forma.html` | Codice: Forma, con la prova interattiva della riga di comando |
| `dist/misura.html` | Codice: Misura, web app da telefono che misura i capi da una foto (repository privato); barra FORMA / MISURA in cima alle due pagine |
| `dist/info.html` | Info / Contatti: bio, curriculum, CV e portfolio in PDF |
| `dist/404.html` | Pagina non trovata, senza script |
| `dist/lavagna.css` · `case.css` · `pages.css` | Tavola · casi studio · Codice e Info |
| `dist/routes.js` | Porta i vecchi indirizzi (`#home`, `#index`, `#<progetto>`, `#code`, `#about`) alle pagine nuove |
| `dist/lang.js` | Italiano / inglese con `data-it` / `data-en`; la scelta resta salvata (`portfolio-language`) |
| `dist/views.js` · `intro.js` | Vista Tavola / Indice, filtri e ritorno allo stesso punto · apertura con le torri (una volta per sessione) |
| `dist/case.js` · `forma.js` · `about.js` | Ritorno alla tavola e ingrandimento dell'atlante · vista 3D di Forma · copia dell'email |
| `dist/img/` | Disegni dei progetti in bianco e nero e dettagli dell'atlante |
| `dist/data.js` · `dims.js` | Testi, didascalie, crediti e immagini dei progetti; dati di Forma; profilo · dimensioni delle immagini |
| `dist/_headers` | Header di sicurezza e cache per Cloudflare |
| `dist/docs/` | CV (senza telefono e città) e portfolio in PDF |
| `check.mjs` | Controlli di integrità e sicurezza, eseguiti anche prima di ogni deploy |

Le pagine sono HTML statico: i testi vengono da `dist/data.js`. Dopo una modifica ai dati le pagine vanno rigenerate con il generatore della lavagna (`tools/build_site.py` nella cartella dello studio, Python con Pillow), che per ora vive fuori da questo repository.

Ogni foto esiste in tre misure WebP (`nome-s` 720 px, `nome-m` 1600 px, `nome` fino a 3200 px per le foto e 4000 px per le tavole), servite con `srcset`. Font self-hosted con licenza SIL OFL: Hanken Grotesk per testi e titoli, Courier Prime per metadati e quote.

## Pagine e interazioni

- **Tavola:** sette progetti su un unico foglio, ognuno come una pila di disegni e fotografie in bianco e nero, a scale e quote diverse. I blocchi entrano mentre si scorre e i fogli si spostano a profondità diverse; al passaggio del cursore la pila si apre e compare la fotografia a colori. All'apertura, una volta per sessione, le torri salgono su una griglia in prospettiva. Sotto i 1000 px diventa una sequenza verticale.
- **Indice:** gli stessi progetti in tabella, con gli stessi filtri (Tutti, Exhibition, Architettura, Product & service). Vista e filtro restano nell'indirizzo; tornando da un progetto si ritrovano vista, filtro, posizione e focus.
- **Casi studio:** cartiglio con corso, docenti, anno e gruppo; disegno d'apertura; capitoli; confronto giorno/notte (BIVACUUM); processo; atlante tecnico con un dettaglio per elaborato, ingrandibile nella pagina; progetti affini per tema.
- **Codice:** Forma, modellatore 3D in Rust in stile Rhino 8. Una vista 3D nella pagina accetta i comandi della demo (Rectangle, SelLast, Extrude, Box, Save…), si ruota trascinando o da tastiera; schermate dell'app, demo di Ask AI, metodo, architettura, repository.
- **Info / Contatti:** email con copia, LinkedIn, GitHub, CV e portfolio in PDF, bio e curriculum.

Il verde lime è solo un segnale (selezione, disponibilità, conferma, passaggio del cursore), mai colore del testo. Movimento ridotto rispettato ovunque.

## Pubblicazione

- **Cloudflare Pages:** il progetto `filippovisentin` è collegato a questo repository. Ogni push su `main` viene pubblicato. Impostazioni: nessun framework, nessun comando di build, cartella di output `dist`. Cloudflare applica gli header di `dist/_headers`.
- **GitHub Pages:** il workflow `.github/workflows/pages.yml` esegue `check.mjs` e pubblica `dist` sotto `/Portfolio/`. I percorsi sono relativi.

`robots.txt`, `sitemap.xml` e l'URL canonico indicano Cloudflare come indirizzo principale. Dettagli sulla sicurezza in [SECURITY.md](SECURITY.md).

I contenuti e le immagini restano dei rispettivi autori; i crediti dei progetti di gruppo sono riportati nelle schede.

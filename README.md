# Filippo Antonio Visentin — Portfolio

Portfolio bilingue IT/EN di un designer di prodotto e d'interni (Politecnico di Milano): sette progetti, la pagina Codice dedicata a Forma, bio con CV scaricabile. HTML, CSS e JavaScript senza dipendenze, senza tracciamento e senza servizi esterni.

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

Verifica la sintassi e l'integrità del sito: immagini uniche, nessun file mancante o inutilizzato, traduzioni complete, CSP, nessuno script inline o di terze parti.

## Struttura

| File | Contenuto |
| --- | --- |
| `dist/index.html` | Pagina unica, intro di caricamento, CSP |
| `dist/data.js` | Testi, didascalie, corsi, docenti e immagini dei progetti; dati di Forma; profilo |
| `dist/app.js` | Router, intro, anello 3D, schede progetto, atlante, lightbox, pagina Codice |
| `dist/style.css` | Aspetto e layout |
| `dist/dims.js` | Dimensioni delle immagini |
| `dist/_headers` | Header di sicurezza e cache per Cloudflare |
| `dist/docs/` | CV (senza telefono e città) e portfolio in PDF |
| `check.mjs` | Controlli di integrità e sicurezza, eseguiti anche prima di ogni deploy |

Ogni immagine esiste in tre misure WebP (`nome-s` 720 px, `nome-m` 1600 px, `nome` fino a 3200 px per le foto e 4000 px per le tavole), servite con `srcset`. Ogni immagine compare una sola volta nel sito. Font self-hosted con licenza SIL OFL: Archivo, JetBrains Mono, Instrument Serif.

## Pagine e interazioni

- **Intro:** un disegno tecnico su una griglia in prospettiva da cui salgono torri bianche, nere e verde acido; poi la vista diventa pianta. Solo alla prima visita della sessione.
- **Home:** anello 3D dei progetti (trascinamento con inerzia, rotella, frecce, tastiera), nome del progetto attivo, transizione condivisa verso la scheda.
- **Indice:** anteprima che segue il cursore, filtri per disciplina.
- **Schede progetto:** corso, docenti, anno e gruppo; capitoli in scrollytelling, confronto giorno/notte (BIVACUUM), galleria orizzontale, atlante tecnico con zoom fino al 400%, lightbox con zoom e swipe.
- **Codice:** "Progettare con l'AI", Forma (modellatore 3D in Rust in stile Rhino 8), demo di Ask AI, riga di comando animata, architettura, repository.
- **Info/Contatti:** bio, formazione, esperienze, strumenti, CV e portfolio in PDF.

Movimento ridotto rispettato ovunque; cursore personalizzato solo con mouse.

## Pubblicazione

- **Cloudflare Pages:** il progetto `filippovisentin` è collegato a questo repository. Ogni push su `main` viene pubblicato. Impostazioni: nessun framework, nessun comando di build, cartella di output `dist`. Cloudflare applica gli header di `dist/_headers`.
- **GitHub Pages:** il workflow `.github/workflows/pages.yml` esegue `check.mjs` e pubblica `dist` sotto `/Portfolio/`. I percorsi sono relativi.

`robots.txt`, `sitemap.xml` e l'URL canonico indicano Cloudflare come indirizzo principale. Dettagli sulla sicurezza in [SECURITY.md](SECURITY.md).

I contenuti e le immagini restano dei rispettivi autori; i crediti dei progetti di gruppo sono riportati nelle schede.

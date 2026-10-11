# Filippo Antonio Visentin — Portfolio

Portfolio bilingue IT/EN con galleria spaziale CSS 3D, sette progetti, bio e contatto email. Nessuna dipendenza da installare, nessun tracciamento, nessun servizio a pagamento.

## Avvio

Con Node.js 20+: `npm run dev`, poi aprire http://127.0.0.1:4173. `npm run check` verifica sintassi e riferimenti alle immagini.

## Pubblicazione

`dist/` contiene l'intero sito statico. I percorsi sono relativi e funzionano anche sotto /Portfolio/. Il workflow `.github/workflows/pages.yml` pubblica `dist` su GitHub Pages. Nella repository, Settings → Pages → Source: GitHub Actions. Avviare il workflow manualmente oppure effettuare un push su main.

La configurazione `.openai` è riservata al mirror Sites e non serve su GitHub.

## Contenuti

Fonte principale: BBB_Portfolio.pdf; tesi: BOOK_tesi_da_stampare.pdf. Bio e immagini dagli archivi forniti dall'autore. MONOBLOCK è una scheda autonoma. A matter of presence è esplicitamente collegato a POLIEDRO. I crediti dei progetti di gruppo sono riportati nelle schede.

Modificare `dist/data.js` per testi e progetti, `dist/app.js` per didascalie e interazioni, `dist/style.css` per aspetto e layout. Il sito usa immagini WebP: miniature per la scena, immagini grandi solo nelle schede. Non contiene i PDF originali, molto pesanti. La risoluzione dei materiali già compressi non viene aumentata artificialmente.

## Interazioni

Trascinamento della scena, frecce a schermo e tastiera, indice alternativo, confronto giorno/notte, capitoli interattivi, galleria a schermo intero con Escape e frecce, selettore lingua persistente. Il movimento si ferma a riposo e quando la pagina non è visibile. La preferenza di movimento ridotto viene rispettata.

## Verifica

Controlli di sintassi e integrità delle immagini inclusi. La verifica visiva nel browser dipende dall'accesso al server locale o alla pubblicazione; non è sostituita dai controlli automatici.

I contenuti e le immagini restano dei rispettivi autori. Il sito presenta progetti e proposte progettuali, non servizi di prenotazione attivi.

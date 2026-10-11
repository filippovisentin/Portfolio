# Spazi — portfolio personale

Progetto indipendente: nessun file di FORMA CAD è stato modificato.

## Avvio

Serve Node.js 20 o successivo. Nella cartella del progetto esegui `npm run dev`, quindi apri http://127.0.0.1:4173. Non occorre installare dipendenze. `npm run check` verifica la sintassi JavaScript.

## Contenuti

Questa è un'anteprima di direzione visiva. Compluvio e Soundplace sono titoli da verificare. Mùrcia è escluso. Gli studi architettonici sono composizioni CSS dimostrative, non render dei progetti. Nome, bio, date, competenze e contatti non sono stati inventati. Per completare il portfolio occorre il PDF originale e la conferma dei contatti pubblici.

Modifica `dist/index.html` per contenuti e immagini reali, `dist/style.css` per la direzione grafica e `dist/app.js` per le schede progetto. Quando inserisci immagini, usa WebP/AVIF con dimensioni esplicite, testo alternativo appropriato e caricamento differito sotto la prima schermata. I font Google hanno fallback locali.

## Pubblicazione

La cartella `dist` è il sito pronto: può essere caricata su un hosting statico. Per GitHub Pages, configura un workflow che carichi `dist` con `actions/upload-pages-artifact` e distribuisca con `actions/deploy-pages`, poi seleziona GitHub Actions nelle impostazioni Pages. Non occorrono build o segreti nel codice. La configurazione `.openai` appartiene a Sites: non copiarla nella repository GitHub personale.

Prima della pubblicazione pubblica, sostituisci i contenuti provvisori con i materiali verificati e configura un contatto reale. Il pulsante contatti dell'anteprima spiega lo stato e non simula l'invio di messaggi.

## Interazioni e accessibilità

Navigazione mobile, schede progetto in dialogo, tab con frecce/Home/End, percorso a comparsa, controllo della luce da tastiera, progresso di lettura e animazioni all'ingresso. Rispetta la preferenza di movimento ridotto; i contenuti restano leggibili senza JavaScript. Il dialogo nativo gestisce Escape, focus e contenimento della navigazione. Nessuna libreria di animazione o tracciamento.

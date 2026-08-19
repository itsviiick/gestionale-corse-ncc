# Gestionale Corse NCC

Applicazione web per organizzare le corse di un servizio NCC (noleggio con
conducente) che riceve prenotazioni da fonti diverse — email, app di
prenotazione, messaggi dei clienti — e non ha un posto unico dove vederle.

Si incolla il testo della prenotazione così com'è: i campi riconoscibili
vengono compilati automaticamente, si controlla e si salva. La corsa finisce
nel calendario e prima della partenza arriva un promemoria via email.

## Cosa fa

- **Inserimento da testo incollato.** Un parser a regole estrae data, ora,
  luoghi, cliente, telefono, prezzo, passeggeri e volo dai formati più comuni.
  Nulla viene salvato senza conferma: i campi non riconosciuti restano vuoti ed
  evidenziati, da completare a mano.
- **Calendario** con viste mese, settimana ed elenco. Toccando una corsa si
  aprono i dettagli, con il numero del cliente cliccabile per chiamarlo.
- **Promemoria via email** prima di ogni corsa, con anticipo configurabile.
  Nessun doppio invio, e nessun promemoria per corse ormai passate.
- **Accesso protetto** da password.

## Come è fatta

| Ambito | Scelta |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Database | PostgreSQL via Prisma |
| Interfaccia | Tailwind CSS |
| Calendario | FullCalendar |
| Email | Nodemailer (SMTP) |
| Accesso | iron-session, password condivisa |

Il fuso orario è gestito esplicitamente su `Europe/Rome`: gli orari si salvano
in UTC e si convertono solo in visualizzazione, così l'ora legale non sposta le
corse.

## Avvio in locale

Servono **Node.js 20+** e un database PostgreSQL (va bene il piano gratuito di
[Neon](https://neon.tech)).

```bash
git clone https://github.com/VickthorMBM/gestionale-corse-ncc.git
cd gestionale-corse-ncc
npm install
cp .env.example .env      # poi compila i valori
npx prisma migrate deploy # crea le tabelle
npm run db:seed           # crea l'utente
npm run dev
```

L'app risponde su `http://localhost:3000`.

Per i promemoria serve un secondo terminale:

```bash
npm run worker
```

Le variabili d'ambiente sono documentate una per una in
[`.env.example`](.env.example).

## Pubblicazione online

L'app è pensata per stare su un hosting serverless (Vercel), dove non esistono
processi sempre attivi. Per questo la logica dei promemoria vive in
[`src/lib/reminders.ts`](src/lib/reminders.ts) ed è richiamata da due punti:

- in locale, dal worker `npm run worker`;
- online, dall'endpoint `GET /api/cron/reminders`, protetto da `CRON_SECRET`.

Online l'endpoint va chiamato periodicamente (ogni 15 minuti è un buon
compromesso) da un servizio di cron esterno, passando l'intestazione:

```
Authorization: Bearer <CRON_SECRET>
```

I cron inclusi nel piano gratuito di Vercel non bastano: girano **una volta al
giorno** e con un'imprecisione fino a un'ora.

### Variabili da impostare sull'hosting

Tutte quelle di `.env.example` tranne `REMINDER_POLL_INTERVAL_CRON`, che serve
solo al worker locale.

## Struttura

```
src/
  app/            pagine e API
    api/cron/     endpoint dei promemoria
  components/     interfaccia (calendario, form, intestazione)
  lib/
    parser.ts     estrazione dei dati dal testo incollato
    reminders.ts  logica dei promemoria
    timezone.ts   conversioni Europe/Rome
worker/           worker per l'esecuzione in locale
prisma/           schema e migrazioni
scripts/          utilità (seed, elenco corse, test del parser)
```

## Estendere il parser

Ogni piattaforma di prenotazione usa un formato suo. Per aggiungerne una,
bastano le sue etichette negli array `LABELS_*` in
[`src/lib/parser.ts`](src/lib/parser.ts).

Per provare le modifiche su testi di esempio:

```bash
npx tsx scripts/test-parser.ts
```

## Sviluppi previsti

- Account separati per più utenti (lo schema è già predisposto: ogni corsa è
  legata al suo proprietario)
- Statistiche su incassi e corse per periodo

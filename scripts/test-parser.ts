import { parseBookingText } from "../src/lib/parser";

const CASI: { nome: string; testo: string }[] = [
  {
    nome: "Testo discorsivo (email / WhatsApp)",
    testo: `Prenotazione da Booking: Mario Rossi, +39 333 1234567, transfer aeroporto
Malpensa -> Hotel Principe di Savoia Milano, il 20/08/2026 alle 14:30,
3 passeggeri, volo AZ123, tariffa 120 euro, pagamento in auto`,
  },
  {
    nome: "Formato a etichette (piattaforma di prenotazione)",
    testo: `Nuova prenotazione #4821
Cliente: Giulia Bianchi
Telefono: 347 8899221
Data: 25/09/2026
Ora: 09:00
Partenza: Stazione Napoli Centrale
Destinazione: Sorrento, Hotel Vesuvio
Passeggeri: 2
Tariffa: 95,50 EUR
Note: bagaglio ingombrante`,
  },
  {
    nome: "Data estesa e forma discorsiva",
    testo: `Sig. Antonio Esposito ha richiesto un transfer da Capodichino a Piazza del Plebiscito
il 3 ottobre 2026, ore 18.45. Due passeggeri. Cell: 3391122334. Prezzo concordato €70`,
  },
  {
    nome: "Testo incompleto (mancano telefono e prezzo)",
    testo: `Transfer per domani
Data: 2026-08-19
Ora: 07:15
Ritiro: Via Toledo 145, Napoli
Destinazione: Aeroporto Capodichino`,
  },
  {
    nome: "Testo povero (quasi nulla di riconoscibile)",
    testo: `mi serve una macchina la prossima settimana, ti chiamo`,
  },
  {
    nome: "Etichette con pax in lettere e volo ICAO a 3 lettere",
    testo: `Nuova prenotazione
Cliente: Mario Rossi
Telefono: +39 333 1234567
Data: 25/08/2026
Ora: 14:30
Aeroporto Napoli Capodichino -> Hotel Excelsior, Sorrento
Volo: EZY8421
Passeggeri: quattro
Prezzo: 150€
Note: bambino con seggiolino`,
  },
];

for (const caso of CASI) {
  console.log(`\n=== ${caso.nome} ===`);
  const risultato = parseBookingText(caso.testo);
  for (const [campo, valore] of Object.entries(risultato)) {
    const stato = valore === null ? "(mancante)" : JSON.stringify(valore);
    console.log(`  ${campo.padEnd(16)} ${stato}`);
  }
}

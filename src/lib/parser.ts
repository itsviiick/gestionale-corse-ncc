/**
 * Parser a regole per il testo delle prenotazioni.
 *
 * Estrae i dati strutturati dal testo incollato senza chiamare servizi esterni:
 * tutto viene elaborato in locale. Ogni campo non riconosciuto torna `null` e
 * viene evidenziato nel form di conferma, dove l'utente lo completa a mano.
 *
 * Per aggiungere il supporto a una nuova fonte, basta aggiungere le sue
 * etichette agli array LABELS_* qui sotto.
 */

export interface ParsedBooking {
  pickupDate: string | null;
  pickupTime: string | null;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  clientName: string | null;
  clientPhone: string | null;
  price: number | null;
  passengerCount: number | null;
  flightNumber: string | null;
  notes: string | null;
}

const MESI: Record<string, number> = {
  gennaio: 1, gen: 1,
  febbraio: 2, feb: 2,
  marzo: 3, mar: 3,
  aprile: 4, apr: 4,
  maggio: 5, mag: 5,
  giugno: 6, giu: 6,
  luglio: 7, lug: 7,
  agosto: 8, ago: 8,
  settembre: 9, set: 9, sett: 9,
  ottobre: 10, ott: 10,
  novembre: 11, nov: 11,
  dicembre: 12, dic: 12,
};

// Etichette riconosciute per ogni campo (minuscole, senza accenti finali variabili).
const LABELS_PICKUP = [
  "luogo di partenza", "indirizzo di partenza", "punto di ritiro", "indirizzo di ritiro",
  "partenza", "ritiro", "prelievo", "pickup", "from", "da",
];
const LABELS_DROPOFF = [
  "luogo di arrivo", "indirizzo di arrivo", "indirizzo di destinazione",
  "destinazione", "arrivo", "dropoff", "drop off", "to", "a",
];
const LABELS_CLIENT = [
  "nome cliente", "nome passeggero", "cliente", "passeggero", "nome", "name", "referente",
];
const LABELS_PHONE = ["telefono", "cellulare", "cell", "tel", "phone", "mobile", "recapito"];
const LABELS_PRICE = ["tariffa", "prezzo", "costo", "importo", "totale", "compenso"];
const LABELS_PAX = ["passeggeri", "pax", "persone", "numero passeggeri", "n. passeggeri"];
const LABELS_FLIGHT = ["volo", "flight", "n. volo", "numero volo"];
const LABELS_NOTES = ["note", "annotazioni", "richieste", "osservazioni", "note aggiuntive"];
const LABELS_DATE = ["data", "giorno", "data servizio", "data del servizio", "date"];
const LABELS_TIME = ["ora", "orario", "ora di ritiro", "orario di ritiro", "time"];

function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

/** Cerca il valore di una riga tipo "Etichetta: valore". */
function findLabeled(text: string, labels: string[]): string | null {
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*([^:]{1,40}?)\s*[:\-–]\s*(.+?)\s*$/);
    if (!match) continue;

    const key = match[1].toLowerCase().trim();
    const value = match[2].trim();
    if (!value) continue;

    if (labels.some((label) => key === label)) {
      return value;
    }
  }
  return null;
}

/**
 * Taglia la coda di un indirizzo quando il testo prosegue con altri dettagli
 * della corsa: "Hotel Duomo, il 20/08/2026 alle 14:30" -> "Hotel Duomo".
 */
function stripMetadataTail(value: string): string {
  const kept: string[] = [];
  for (const part of value.split(",")) {
    const segment = part.trim();
    const isMetadata =
      /\b\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}\b/.test(segment) ||
      /\b\d{1,2}[:.]\d{2}\b/.test(segment) ||
      /^(?:il|lo|la|alle|all'|ore|h)\b/i.test(segment) ||
      /\b(?:passegger|pax|person[ae]|tariffa|prezzo|costo|euro|€|volo|tel\.?|cell)/i.test(segment);
    if (isMetadata) break;
    kept.push(segment);
  }
  return kept.join(", ").trim();
}

function cleanLocation(value: string | null): string | null {
  if (!value) return null;
  const cleaned = stripMetadataTail(value).replace(/[,;.\s]+$/, "").trim();
  return cleaned.length > 1 ? cleaned : null;
}

function parseDate(text: string): string | null {
  const labeled = findLabeled(text, LABELS_DATE);
  const haystack = labeled ?? text;

  // Formato ISO: 2026-08-20
  const iso = haystack.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) return toIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  // Formato italiano: 20/08/2026, 20-08-26, 20.08.2026
  const it = haystack.match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b/);
  if (it) {
    const year = Number(it[3]);
    return toIsoDate(year < 100 ? 2000 + year : year, Number(it[2]), Number(it[1]));
  }

  // Formato esteso: 20 agosto 2026 / 20 ago 2026 / 20 agosto
  const long = haystack.match(
    /\b(\d{1,2})\s*(?:°|º)?\s+(?:di\s+)?([a-zà-ù]+)\.?(?:\s+(\d{4}))?\b/i
  );
  if (long) {
    const month = MESI[long[2].toLowerCase()];
    if (month) {
      const year = long[3] ? Number(long[3]) : new Date().getFullYear();
      return toIsoDate(year, month, Number(long[1]));
    }
  }

  return null;
}

function toIsoDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseTime(text: string): string | null {
  const labeled = findLabeled(text, LABELS_TIME);
  const haystack = labeled ?? text;

  // Con parola chiave davanti: "ore 14:30", "alle 14.30", "h 14:30"
  const keyed = haystack.match(/\b(?:ore|alle|all'|h)\s*(\d{1,2})[:.](\d{2})\b/i);
  if (keyed) return toTime(Number(keyed[1]), Number(keyed[2]));

  // Solo due punti (piu sicuro: evita di confondersi con le date)
  const colon = haystack.match(/\b(\d{1,2}):(\d{2})\b/);
  if (colon) return toTime(Number(colon[1]), Number(colon[2]));

  // Nel valore di un'etichetta esplicita accettiamo anche il punto
  if (labeled) {
    const dotted = labeled.match(/\b(\d{1,2})\.(\d{2})\b/);
    if (dotted) return toTime(Number(dotted[1]), Number(dotted[2]));
  }

  return null;
}

function toTime(hours: number, minutes: number): string | null {
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parsePhone(text: string): string | null {
  const labeled = findLabeled(text, LABELS_PHONE);
  if (labeled) {
    const fromLabel = labeled.match(/(\+?\d[\d\s.\-/]{6,})/);
    if (fromLabel) return tidyPhone(fromLabel[1]);
  }

  // Cellulare italiano: prefisso opzionale +39, poi 3xx seguito da 6-7 cifre
  const mobile = text.match(/(\+39[\s.\-]?)?\b3\d{2}[\s.\-]?\d{3}[\s.\-]?\d{3,4}\b/);
  if (mobile) return tidyPhone(mobile[0]);

  // Numero preceduto da +39 (fisso o estero)
  const intl = text.match(/\+\d{1,3}[\s.\-]?\d[\d\s.\-]{6,}/);
  if (intl) return tidyPhone(intl[0]);

  return null;
}

function tidyPhone(value: string): string {
  return value.replace(/[.\-/]/g, " ").replace(/\s+/g, " ").trim();
}

function parsePrice(text: string): number | null {
  const labeled = findLabeled(text, LABELS_PRICE);
  const haystack = labeled ?? text;

  // Con simbolo o parola valuta, prima o dopo il numero
  const withCurrency = haystack.match(
    /(?:€|eur\b|euro\b)\s*(\d+(?:[.,]\d{1,2})?)|(\d+(?:[.,]\d{1,2})?)\s*(?:€|eur\b|euro\b)/i
  );
  if (withCurrency) {
    return toAmount(withCurrency[1] ?? withCurrency[2]);
  }

  // Se l'etichetta era esplicita, basta il numero nudo
  if (labeled) {
    const bare = labeled.match(/(\d+(?:[.,]\d{1,2})?)/);
    if (bare) return toAmount(bare[1]);
  }

  return null;
}

function toAmount(raw: string): number | null {
  const value = Number(raw.replace(",", "."));
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function parsePassengers(text: string): number | null {
  const labeled = findLabeled(text, LABELS_PAX);
  if (labeled) {
    const fromLabel = labeled.match(/\b(\d{1,2})\b/);
    if (fromLabel) return toCount(fromLabel[1]);
  }

  // "3 passeggeri", "2 pax", "4 persone"
  const before = text.match(/\b(\d{1,2})\s*(?:passegger\w*|pax|person[ae]|adult[oi]|pass\.)\b/i);
  if (before) return toCount(before[1]);

  // "passeggeri 3"
  const after = text.match(/\b(?:passegger\w*|pax|person[ae])\s*[:.]?\s*(\d{1,2})\b/i);
  if (after) return toCount(after[1]);

  // Numero scritto in lettere: "due passeggeri", "tre persone"
  const spelled = text.match(
    /\b(un[oa]?|due|tre|quattro|cinque|sei|sette|otto|nove|dieci)\s+(?:passegger\w*|person[ae]|pax|adult[oi])\b/i
  );
  if (spelled) {
    const numeri: Record<string, number> = {
      un: 1, uno: 1, una: 1, due: 2, tre: 3, quattro: 4, cinque: 5,
      sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10,
    };
    return numeri[spelled[1].toLowerCase()] ?? null;
  }

  return null;
}

function toCount(raw: string): number | null {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 && value < 100 ? value : null;
}

function parseFlight(text: string): string | null {
  const labeled = findLabeled(text, LABELS_FLIGHT);
  const haystack = labeled ?? text;

  const keyed = haystack.match(/\b(?:volo|flight)\s*(?:n\.?|numero)?\s*[:.]?\s*([A-Z]{2}\s?\d{1,4})\b/i);
  if (keyed) return keyed[1].toUpperCase().replace(/\s+/g, "");

  // Codice IATA nudo: due lettere maiuscole + numero (es. AZ123, FR1234)
  const bare = text.match(/\b([A-Z]{2}\d{2,4})\b/);
  if (bare) return bare[1].toUpperCase();

  return null;
}

function parseLocations(text: string): { pickup: string | null; dropoff: string | null } {
  // 1. Etichette esplicite
  const labeledPickup = cleanLocation(findLabeled(text, LABELS_PICKUP));
  const labeledDropoff = cleanLocation(findLabeled(text, LABELS_DROPOFF));
  if (labeledPickup || labeledDropoff) {
    return { pickup: labeledPickup, dropoff: labeledDropoff };
  }

  // 2. Freccia: "Malpensa -> Hotel Duomo"
  const arrow = text.match(/^(.{2,120}?)\s*(?:->|-->|→|=>|>>)\s*(.{2,120}?)\s*$/m);
  if (arrow) {
    return { pickup: cleanLocation(arrow[1]), dropoff: cleanLocation(arrow[2]) };
  }

  // 3. Forma discorsiva: "da Malpensa a Milano Centrale"
  const fromTo = text.match(/\bda\s+(.{2,80}?)\s+a\s+(.{2,80}?)(?:[,;.\n]|$)/i);
  if (fromTo) {
    return { pickup: cleanLocation(fromTo[1]), dropoff: cleanLocation(fromTo[2]) };
  }

  return { pickup: null, dropoff: null };
}

/** Parole tipiche di un luogo: evitano di scambiare un indirizzo per un nome. */
const PAROLE_LUOGO =
  /^(?:aeroporto|stazione|hotel|albergo|via|viale|piazza|piazzale|corso|porto|terminal|molo|largo|strada|residence|b&b|villa|ospedale|centro)\b/i;

/** Riconosce "Mario Rossi" ma non "Aeroporto Capodichino" o "Via Toledo 145". */
function asPersonName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length > 60 || /[\d@]/.test(trimmed) || PAROLE_LUOGO.test(trimmed)) return null;
  const match = trimmed.match(/^([A-ZÀ-Ù][a-zà-ù']+(?:\s+(?:d[aeiou]l?|de|di)?\s*[A-ZÀ-Ù][a-zà-ù']+)+)$/);
  return match ? match[1] : null;
}

function parseClientName(text: string): string | null {
  const labeled = findLabeled(text, LABELS_CLIENT);
  if (labeled) {
    const cleaned = labeled
      .replace(/\b(?:[Ss]ig\.?|[Ss]ig\.ra|[Ss]ignor[ae]?|Mr\.?|Mrs\.?|[Dd]ott\.?)\s*/g, "")
      .trim();
    if (cleaned.length > 1) return cleaned;
  }

  // Titolo di cortesia seguito dal nome: "Sig. Mario Rossi"
  const titled = text.match(
    /\b(?:[Ss]ig\.?|[Ss]ig\.ra|[Ss]ignor[ae]?|Mr\.?|Mrs\.?)\s+([A-ZÀ-Ù][a-zà-ù']+(?:\s+[A-ZÀ-Ù][a-zà-ù']+)*)/
  );
  if (titled) return titled[1].trim();

  // Riga intera che contiene solo un nome
  for (const line of text.split("\n")) {
    if (/[:]/.test(line)) continue;
    const name = asPersonName(line);
    if (name) return name;
  }

  // Nome subito dopo un'etichetta non riservata ad altri campi
  // (es. "Prenotazione da Booking: Mario Rossi, +39 333 ...")
  const riservate = [
    ...LABELS_PICKUP, ...LABELS_DROPOFF, ...LABELS_PHONE, ...LABELS_PRICE,
    ...LABELS_PAX, ...LABELS_FLIGHT, ...LABELS_NOTES, ...LABELS_DATE, ...LABELS_TIME,
  ];
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*([^:]{1,40}?)\s*:\s*(.+)$/);
    if (!match) continue;
    if (riservate.includes(match[1].toLowerCase().trim())) continue;
    const name = asPersonName(match[2].split(",")[0]);
    if (name) return name;
  }

  return null;
}

function parseNotes(text: string): string | null {
  const labeled = findLabeled(text, LABELS_NOTES);
  if (labeled) return labeled;

  // Metodo di pagamento: informazione ricorrente e utile da conservare
  const payment = text.match(/\b(pagamento\s+[^,;.\n]{2,60})/i);
  if (payment) return payment[1].trim();

  return null;
}

export function parseBookingText(rawText: string): ParsedBooking {
  const text = normalize(rawText);
  const { pickup, dropoff } = parseLocations(text);

  return {
    pickupDate: parseDate(text),
    pickupTime: parseTime(text),
    pickupLocation: pickup,
    dropoffLocation: dropoff,
    clientName: parseClientName(text),
    clientPhone: parsePhone(text),
    price: parsePrice(text),
    passengerCount: parsePassengers(text),
    flightNumber: parseFlight(text),
    notes: parseNotes(text),
  };
}

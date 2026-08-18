import { DateTime } from "luxon";

export const APP_ZONE = "Europe/Rome";

const INPUT_FORMAT = "yyyy-LL-dd'T'HH:mm";

export function toRomeInputValue(date: Date | string): string {
  const dt =
    typeof date === "string"
      ? DateTime.fromISO(date, { zone: "utc" })
      : DateTime.fromJSDate(date, { zone: "utc" });
  return dt.setZone(APP_ZONE).toFormat(INPUT_FORMAT);
}

export function fromRomeInputValueToISO(value: string): string {
  const iso = DateTime.fromFormat(value, INPUT_FORMAT, { zone: APP_ZONE }).toUTC().toISO();
  if (!iso) throw new Error(`Valore data/ora non valido: ${value}`);
  return iso;
}

export function formatRome(date: Date | string, format = "dd/LL/yyyy HH:mm"): string {
  const dt =
    typeof date === "string"
      ? DateTime.fromISO(date, { zone: "utc" })
      : DateTime.fromJSDate(date, { zone: "utc" });
  // setLocale: senza, i nomi di giorni e mesi verrebbero resi in inglese.
  return dt.setZone(APP_ZONE).setLocale("it").toFormat(format);
}

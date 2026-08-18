import { prisma } from "./prisma";
import { sendReminderEmail } from "./email";
import { formatRome } from "./timezone";

/**
 * Logica dei promemoria, condivisa fra due modi di esecuzione:
 * - in locale, dal worker `npm run worker` (processo sempre attivo);
 * - online, dall'endpoint /api/cron/reminders chiamato da un servizio di cron.
 *
 * È scritta per essere eseguita di continuo senza effetti collaterali: una
 * corsa già avvisata non viene mai riavvisata, perché `reminderSent` viene
 * messo a true subito dopo l'invio riuscito.
 */

const GRACE_MINUTES = Number(process.env.REMINDER_GRACE_MINUTES ?? 60);

export interface ReminderRunResult {
  inviati: number;
  saltati: number;
  errori: number;
}

function componiEmail(ride: {
  pickupDateTime: Date;
  clientName: string;
  pickupLocation: string;
  dropoffLocation: string | null;
  clientPhone: string | null;
  passengerCount: number | null;
  flightNumber: string | null;
  notes: string | null;
}): string {
  const righe = [
    `Hai una corsa il ${formatRome(ride.pickupDateTime)} con ${ride.clientName}.`,
    "",
    `Ritiro: ${ride.pickupLocation}`,
  ];
  if (ride.dropoffLocation) righe.push(`Destinazione: ${ride.dropoffLocation}`);
  if (ride.clientPhone) righe.push(`Telefono: ${ride.clientPhone}`);
  if (ride.passengerCount != null) righe.push(`Passeggeri: ${ride.passengerCount}`);
  if (ride.flightNumber) righe.push(`Volo: ${ride.flightNumber}`);
  if (ride.notes) righe.push(`Note: ${ride.notes}`);
  return righe.join("\n");
}

export async function runReminderTick(): Promise<ReminderRunResult> {
  const now = new Date();
  const result: ReminderRunResult = { inviati: 0, saltati: 0, errori: 0 };

  const users = await prisma.user.findMany();

  for (const user of users) {
    const threshold = new Date(now.getTime() + user.reminderLeadMinutes * 60_000);
    const graceLimit = new Date(now.getTime() - GRACE_MINUTES * 60_000);

    const dueRides = await prisma.ride.findMany({
      where: {
        ownerId: user.id,
        status: "CONFIRMED",
        reminderSent: false,
        pickupDateTime: { lte: threshold },
      },
    });

    for (const ride of dueRides) {
      // Corsa troppo vecchia: la marchiamo come avvisata senza mandare nulla,
      // per non recapitare promemoria di corse ormai passate.
      if (ride.pickupDateTime < graceLimit) {
        await prisma.ride.update({
          where: { id: ride.id },
          data: { reminderSent: true, reminderSentAt: now },
        });
        result.saltati += 1;
        console.log(`[reminder] saltata corsa passata ${ride.id} (${ride.clientName})`);
        continue;
      }

      try {
        await sendReminderEmail(
          user.email,
          `Promemoria corsa: ${ride.clientName} — ${formatRome(ride.pickupDateTime, "dd/LL HH:mm")}`,
          componiEmail(ride)
        );
        await prisma.ride.update({
          where: { id: ride.id },
          data: { reminderSent: true, reminderSentAt: new Date() },
        });
        result.inviati += 1;
        console.log(`[reminder] inviato promemoria per ${ride.id} (${ride.clientName})`);
      } catch (err) {
        result.errori += 1;
        console.error(`[reminder] errore nell'invio per la corsa ${ride.id}:`, err);
      }
    }
  }

  return result;
}

import "dotenv/config";
import cron from "node-cron";
import { runReminderTick } from "../src/lib/reminders";

/**
 * Worker per l'esecuzione in locale. Online la stessa logica viene invocata
 * dall'endpoint /api/cron/reminders, perché su hosting serverless non
 * esistono processi sempre attivi.
 */
async function tick() {
  try {
    const esito = await runReminderTick();
    if (esito.inviati || esito.saltati || esito.errori) {
      console.log(
        `[reminder] inviati=${esito.inviati} saltati=${esito.saltati} errori=${esito.errori}`
      );
    }
  } catch (err) {
    console.error("[reminder] errore durante l'esecuzione:", err);
  }
}

cron.schedule(process.env.REMINDER_POLL_INTERVAL_CRON ?? "*/5 * * * *", tick, {
  noOverlap: true,
});

console.log("Worker promemoria avviato. In ascolto...");
tick();

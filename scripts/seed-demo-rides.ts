import "dotenv/config";
import { prisma } from "../src/lib/prisma";


const ORA = 60 * 60 * 1000;
const GIORNO = 24 * ORA;

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("Nessun utente trovato. Esegui prima `npm run db:seed`.");

  const corse = [
    {
      offset: 6 * ORA,
      clientName: "Luca Marino",
      clientPhone: "331 2244556",
      pickupLocation: "Aeroporto Capodichino",
      dropoffLocation: "Positano, Hotel Le Sirenuse",
      price: 180,
      passengerCount: 4,
      flightNumber: "FR1234",
      notes: "Due valigie grandi",
      status: "CONFIRMED" as const,
    },
    {
      offset: GIORNO + 9 * ORA,
      clientName: "Giulia Bianchi",
      clientPhone: "347 8899221",
      pickupLocation: "Stazione Napoli Centrale",
      dropoffLocation: "Sorrento, Hotel Vesuvio",
      price: 95.5,
      passengerCount: 2,
      flightNumber: null,
      notes: "Bagaglio ingombrante",
      status: "CONFIRMED" as const,
    },
    {
      offset: 3 * GIORNO + 5 * ORA,
      clientName: "Paolo Ferrara",
      clientPhone: "349 7788990",
      pickupLocation: "Salerno, Piazza della Concordia",
      dropoffLocation: "Napoli, Piazza del Plebiscito",
      price: 120,
      passengerCount: 3,
      flightNumber: null,
      notes: null,
      status: "CONFIRMED" as const,
    },
    {
      offset: -2 * GIORNO,
      clientName: "Antonio Esposito",
      clientPhone: "339 1122334",
      pickupLocation: "Via Toledo 145, Napoli",
      dropoffLocation: "Aeroporto Capodichino",
      price: 45,
      passengerCount: 1,
      flightNumber: "AZ1789",
      notes: "Pagato in anticipo",
      status: "COMPLETED" as const,
    },
  ];

  const now = Date.now();
  for (const corsa of corse) {
    const { offset, ...dati } = corsa;
    await prisma.ride.create({
      data: {
        ...dati,
        ownerId: user.id,
        pickupDateTime: new Date(now + offset),
        rawText: "(corsa dimostrativa)",
        source: "MANUAL_ENTRY",
        reminderSent: offset < 0,
      },
    });
  }

  console.log(`Create ${corse.length} corse dimostrative.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

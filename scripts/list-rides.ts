import "dotenv/config";
import { prisma } from "../src/lib/prisma";


async function main() {
  const rides = await prisma.ride.findMany({ orderBy: { pickupDateTime: "asc" } });
  for (const ride of rides) {
    console.log(
      `${ride.id} | ${ride.pickupDateTime.toISOString()} | ${ride.clientName} | status=${ride.status} | reminderSent=${ride.reminderSent} | sentAt=${ride.reminderSentAt?.toISOString() ?? "-"}`
    );
  }
  if (rides.length === 0) console.log("(nessuna corsa)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import "dotenv/config";
import { prisma } from "../src/lib/prisma";


async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npx tsx scripts/set-user-email.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("Nessun utente trovato. Esegui prima `npm run db:seed`.");
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { email },
  });

  console.log(`Email aggiornata: ${updated.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

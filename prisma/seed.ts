import "dotenv/config";
import { prisma } from "../src/lib/prisma";


async function main() {
  const email = process.env.SEED_USER_EMAIL ?? "admin@example.com";
  const name = process.env.SEED_USER_NAME ?? "Amministratore";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Utente già esistente: ${existing.email}`);
    return;
  }

  const user = await prisma.user.create({
    data: { email, name },
  });

  console.log(`Utente creato: ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

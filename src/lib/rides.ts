import { prisma } from "./prisma";

export async function getOwnerUser() {
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error("Nessun utente trovato. Esegui `npm run db:seed` prima di usare l'app.");
  }
  return user;
}

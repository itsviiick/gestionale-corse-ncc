import "dotenv/config";
import { prisma } from "../src/lib/prisma";


async function main() {
  const result = await prisma.ride.deleteMany({});
  console.log(`Corse eliminate: ${result.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

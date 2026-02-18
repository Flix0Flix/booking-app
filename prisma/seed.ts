import prisma from "@/lib/prisma";

async function main() {
  const names = ["Lokal A", "Lokal B", "Konferensrum 1"];

  for (const name of names) {
    await prisma.resource.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seeded resources");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

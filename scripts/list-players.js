const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const players = await prisma.player.findMany({
    select: { name: true, clan: true },
    orderBy: { name: 'asc' }
  });
  console.log(JSON.stringify(players, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



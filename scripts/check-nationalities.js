const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const players = await prisma.player.findMany({
    where: { nationality: { not: null } },
    select: { name: true, nationality: true },
    take: 20
  });
  console.log('Sample nationalities in DB:');
  players.forEach(p => console.log(`  ${p.name}: ${p.nationality}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



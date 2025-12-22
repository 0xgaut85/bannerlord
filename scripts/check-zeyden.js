const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const z = await p.player.findFirst({
    where: { name: { contains: 'Zeyden', mode: 'insensitive' } }
  });
  console.log('Player:', JSON.stringify(z, null, 2));
  
  if (z) {
    const r = await p.rating.findMany({
      where: { playerId: z.id },
      include: { rater: { select: { discordName: true, division: true, discordId: true } } }
    });
    console.log('Ratings:', JSON.stringify(r, null, 2));
  }
  
  await p.$disconnect();
}

main();


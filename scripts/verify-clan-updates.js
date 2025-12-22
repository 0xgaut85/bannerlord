const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CLAN_CHECKS = [
  { name: "BD", expectedClan: "Div" },
  { name: "Burst", expectedClan: "IE" },
  { name: "Bingus", expectedClan: "VALE" },
  { name: "Aemond", expectedClan: "SVRN" },
  { name: "Vincent", expectedClan: "ODIN" },
];

async function main() {
  console.log('Verifying clan updates...\n');
  
  for (const c of CLAN_CHECKS) {
    const player = await prisma.player.findUnique({ 
      where: { name: c.name },
      select: { name: true, clan: true }
    });
    if (player) {
      const ok = player.clan === c.expectedClan;
      console.log(`${ok ? '✅' : '❌'} ${player.name}: ${player.clan} (expected: ${c.expectedClan})`);
    } else {
      console.log(`❌ NOT FOUND: ${c.name}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



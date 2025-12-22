const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check if new players exist
  const testNames = ['Beast', 'LeJew', 'ElMatador', 'Vader', 'TheMoon', 'FrejRose', 'Banjolord'];
  
  console.log('Checking for new players...\n');
  
  for (const name of testNames) {
    const player = await prisma.player.findUnique({ 
      where: { name },
      select: { id: true, name: true, clan: true, category: true }
    });
    if (player) {
      console.log(`✅ Found: ${player.name} (clan: ${player.clan}, category: ${player.category})`);
    } else {
      console.log(`❌ NOT FOUND: ${name}`);
    }
  }
  
  // Count total players
  const totalPlayers = await prisma.player.count();
  console.log(`\nTotal players in database: ${totalPlayers}`);
  
  // Get last 10 added players
  const recentPlayers = await prisma.player.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { name: true, clan: true, createdAt: true }
  });
  
  console.log('\nLast 10 players added:');
  recentPlayers.forEach(p => {
    console.log(`  - ${p.name} (${p.clan || 'no clan'}) - ${p.createdAt}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



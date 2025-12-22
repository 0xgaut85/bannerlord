const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const UPDATES = [
  { name: "Silver", nationality: "RU" },       // Russia
  { name: "Inspire", nationality: "RU" },      // Russia
  { name: "Authari", nationality: "TR" },      // Turkey
  { name: "Siberia", nationality: "SE" },      // Sweden
  { name: "CARNIFEX", nationality: "TR" },     // Turkey
  { name: "Aela", nationality: "PL" },         // Poland
  { name: "SirAlecks", nationality: "ES" },    // Spain
  { name: "DragonKing", nationality: "FR" },   // France
  { name: "Neena", nationality: "FR" },        // France
  { name: "Camm15elbe", nationality: "DE" },   // Germany
  { name: "troechka", nationality: "RU" },     // Russia
];

async function main() {
  console.log('=== UPDATING FLAGS ===\n');
  
  let updated = 0, notFound = 0;
  
  for (const u of UPDATES) {
    const existing = await prisma.player.findUnique({ where: { name: u.name } });
    if (!existing) {
      console.log(`❌ Not found: ${u.name}`);
      notFound++;
      continue;
    }
    
    await prisma.player.update({
      where: { name: u.name },
      data: { nationality: u.nationality }
    });
    console.log(`🏳️ ${u.name} → ${u.nationality}`);
    updated++;
  }
  
  console.log(`\nDone! Updated: ${updated}, Not found: ${notFound}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const UPDATES = [
  { name: "Koso", nationality: "TR" },         // Turkey
  { name: "Longinus", nationality: "PL" },     // Poland
  { name: "Aesten", nationality: "FR" },       // France
  { name: "royal", nationality: "TR" },        // Turkey
  { name: "Quadri", nationality: "UA" },       // Ukraine
  { name: "Retamar", nationality: "ES" },      // Spain
  { name: "Tomppa", nationality: "FI" },       // Finland
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



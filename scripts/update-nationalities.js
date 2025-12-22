const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Player nationality updates with ISO 2-letter codes
const NATIONALITY_UPDATES = [
  { name: "Arni", nationality: "RU" },        // Russia
  { name: "Popo", nationality: "PL" },        // Poland
  { name: "Chuckster", nationality: "FR" },   // France
  { name: "Kamby", nationality: "PL" },       // Poland
  { name: "Pablo", nationality: "ES" },       // Spain
  { name: "Tom54p", nationality: "PL" },      // Poland
  { name: "Joker", nationality: "DE" },       // Germany
  { name: "Sunny", nationality: "DE" },       // Germany
  { name: "cleqfy", nationality: "TR" },      // Turkey
  { name: "Nutella", nationality: "TR" },     // Turkey
  { name: "Beast", nationality: "DE" },       // Germany
  { name: "DarkLight", nationality: "ES" },   // Spain
  { name: "Lam", nationality: "NL" },         // Netherlands (Dutch)
  { name: "Nightwing", nationality: "DE" },   // Germany
  { name: "Enter", nationality: "PL" },       // Poland
  { name: "Aiku", nationality: "GB" },        // England/UK
  { name: "Achilles", nationality: "SE" },    // Sweden
  { name: "Runcop", nationality: "GB" },      // England/UK
  { name: "RayZen", nationality: "FR" },      // France
  { name: "BD", nationality: "DE" },          // Germany
  { name: "Alsandair", nationality: "GR" },   // Greece
  { name: "Rigo", nationality: "FR" },        // France
  { name: "Porkins", nationality: "GB" },     // Scotland -> using GB
  { name: "TheRealPablo", nationality: "DE" }, // Germany
  { name: "MrAsh", nationality: "TR" },       // Turkey
];

async function main() {
  console.log('=== UPDATING NATIONALITIES ===\n');
  
  let updatedCount = 0;
  let notFoundCount = 0;
  
  for (const u of NATIONALITY_UPDATES) {
    try {
      const existing = await prisma.player.findUnique({ where: { name: u.name } });
      
      if (!existing) {
        console.log(`❌ Not found: ${u.name}`);
        notFoundCount++;
        continue;
      }
      
      await prisma.player.update({
        where: { name: u.name },
        data: { nationality: u.nationality }
      });
      
      console.log(`🏳️ Updated: ${u.name} → ${u.nationality}`);
      updatedCount++;
    } catch (e) {
      console.log(`❌ Error updating ${u.name}: ${e.message}`);
    }
  }
  
  console.log(`\n=== COMPLETE ===`);
  console.log(`Updated: ${updatedCount}, Not found: ${notFoundCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



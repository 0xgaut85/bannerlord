const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FIXES = [
  { name: "Aiku", nationality: "gb-eng" },     // England
  { name: "Runcop", nationality: "gb-eng" },   // England
  { name: "Porkins", nationality: "gb-sct" },  // Scotland
];

async function main() {
  console.log('=== FIXING UK FLAGS ===\n');
  
  for (const u of FIXES) {
    const result = await prisma.player.update({
      where: { name: u.name },
      data: { nationality: u.nationality }
    });
    console.log(`✅ ${u.name} → ${u.nationality}`);
  }
  
  console.log('\nDone!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



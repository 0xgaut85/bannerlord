const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const UPDATES = [
  { name: "Zenepl", nationality: "DE" },
  { name: "Volv", nationality: "RU" },
  { name: "Schredinger", nationality: "PL" },
  { name: "Sharky", nationality: "DE" },
  { name: "Raichu", nationality: "TR" },
  { name: "Para", nationality: "FR" },
  { name: "ONeil", nationality: "IE" },
  { name: "Mazewind", nationality: "FR" },
  { name: "Kassia", nationality: "UA" },
  { name: "Jakhline", nationality: "FR" },
  { name: "Hairless", nationality: "PL" },
  { name: "Diabelek", nationality: "PL" },
  { name: "Dest", nationality: "TR" },
  { name: "Demochi", nationality: "DE" },
  { name: "Daban", nationality: "PL" },
  { name: "AnrgyNerd", nationality: "gb-eng", newName: "Angrynerd" },
  { name: "Artemeis", nationality: "RU" },
  { name: "JaximusFate", nationality: "PL" },
  { name: "Langelau", nationality: "FR" },
  { name: "Maximou", nationality: "FR" },
  { name: "Zeyden", nationality: "FR" },
  { name: "Wegnas", nationality: "TR" },
  { name: "Wonders", nationality: "TR" },
  { name: "Red_War", nationality: "FR" },
  { name: "Arglaxx", nationality: "RS" },
];

async function main() {
  console.log('=== UPDATING FLAGS ===\n');
  
  let updated = 0, notFound = 0;
  
  for (const u of UPDATES) {
    const existing = await p.player.findFirst({
      where: { name: { equals: u.name, mode: 'insensitive' } }
    });
    
    if (!existing) {
      console.log(`❌ Not found: ${u.name}`);
      notFound++;
      continue;
    }
    
    const updateData = { nationality: u.nationality };
    if (u.newName) updateData.name = u.newName;
    
    await p.player.update({
      where: { id: existing.id },
      data: updateData
    });
    
    if (u.newName) {
      console.log(`🏳️ ${existing.name} → ${u.newName} (${u.nationality})`);
    } else {
      console.log(`🏳️ ${existing.name} → ${u.nationality}`);
    }
    updated++;
  }
  
  console.log(`\nDone! Updated: ${updated}, Not found: ${notFound}`);
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());


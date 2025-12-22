const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CLAN UPDATES (existing players)
const CLAN_UPDATES = [
  { name: "BD", newClan: "Div" },
  { name: "Qaxey", newClan: "Div" },
  { name: "bella", newClan: "VW" },
  { name: "Alsandair", newClan: "Div" },
  { name: "royal", newClan: "IE" },
  { name: "EnderKlas", newClan: "SM" },
  { name: "Retamar", newClan: "BDCT" },
  { name: "Nex", newClan: "GM" },
  { name: "Ceh", newClan: "DWX" },
  { name: "Jungle VIP", newClan: "VG" },
  { name: "thetis", newClan: "VALE" },
  { name: "chonkRick", newClan: "IZpp" },
  { name: "Tomppa", newClan: "Div" },
  { name: "Altar of The Manes", newClan: "DWX" },
  { name: "Baycu", newClan: "VALE" },
  { name: "Jujana", newClan: "STIX" },
  { name: "Kenny", newClan: "AAEA" },
  { name: "Waff", newClan: "WoM" },
  { name: "GameHonor", newClan: "PNDR" },
  { name: "VejVar", newClan: "SVCI" },
  { name: "Rolf", newClan: "VALE" },
  { name: "Quesek", newClan: "KoPL" },
  { name: "Microsoft Paperclip", newClan: "BDCT" },
  { name: "DragonElite", newClan: "SVCI" },
  { name: "TheGioMan", newClan: "STIX" },
  { name: "Kuesh", newClan: "RS" },
  { name: "Benjen Stark", newClan: "CI" },
  { name: "Aemond", newClan: "SVRN" },
  { name: "Vincent", newClan: "ODIN" },
  { name: "Sait", newClan: "KoWA" },
  { name: "Pex", newClan: "SVCI" },
  { name: "Burst", newClan: "IE" },
  { name: "Lasand", newClan: "WoM" },
  { name: "Agony", newClan: "BDCT" },
  { name: "Bingus", newClan: "VALE" },
];

async function main() {
  console.log('=== UPDATING CLANS ===\n');
  
  let updatedCount = 0;
  let notFoundCount = 0;
  
  for (const u of CLAN_UPDATES) {
    try {
      const existing = await prisma.player.findUnique({ where: { name: u.name } });
      
      if (!existing) {
        console.log(`  ❌ Not found: ${u.name}`);
        notFoundCount++;
        continue;
      }
      
      await prisma.player.update({
        where: { name: u.name },
        data: { clan: u.newClan }
      });
      
      console.log(`  🔄 Updated: ${u.name} (${existing.clan} → ${u.newClan})`);
      updatedCount++;
    } catch (e) {
      console.log(`  ❌ Error updating ${u.name}: ${e.message}`);
    }
  }
  
  console.log(`\n=== COMPLETE ===`);
  console.log(`Updated: ${updatedCount}, Not found: ${notFoundCount}`);
}

main()
  .catch((e) => {
    console.error('ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



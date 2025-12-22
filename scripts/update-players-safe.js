const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// NEW PLAYERS TO ADD (74 total) - Default to INFANTRY
const NEW_PLAYERS = [
  { name: "FrejRose", clan: "SM" },
  { name: "FaZe", clan: null },
  { name: "MrAsh", clan: "GS" },
  { name: "N1njaBread", clan: "SVRN" },
  { name: "Vader", clan: "DB" },
  { name: "Asian", clan: "Div" },
  { name: "Daburon", clan: null },
  { name: "Banjolord", clan: "DM" },
  { name: "Tavernier", clan: "SVRN" },
  { name: "_Madara_", clan: null },
  { name: "winter.", clan: "RPGS" },
  { name: "Anohen", clan: "KoPL" },
  { name: "LeJew", clan: null },
  { name: "TheRealPablo", clan: "DR" },
  { name: "Az", clan: "Div" },
  { name: "Embo", clan: "STIX" },
  { name: "Pina", clan: "Eque" },
  { name: "Witch", clan: "CI" },
  { name: "DL", clan: "IE" },
  { name: "Terminal", clan: "Eque" },
  { name: "Draz", clan: null },
  { name: "ElMatador", clan: "IE" },
  { name: "Masternax", clan: "BDCT" },
  { name: "beran", clan: "VW" },
  { name: "Sowizdrzal", clan: "IZpp" },
  { name: "qwueser", clan: null },
  { name: "loz", clan: "Div" },
  { name: "Eviscerate", clan: "CI" },
  { name: "dertli", clan: "VW" },
  { name: "LION", clan: "VLNT" },
  { name: "bomba", clan: "Div" },
  { name: "retkabas", clan: "VSC" },
  { name: "jonasjo", clan: "Div" },
  { name: "NEW_PLAYER", clan: "VW" },
  { name: "Alberus", clan: "VLNF" },
  { name: "nova", clan: "DB" },
  { name: "Hideyoshi", clan: null },
  { name: "blackless", clan: "DWX" },
  { name: "hollow.", clan: "SVRN" },
  { name: "Trieb", clan: "UKRs" },
  { name: "Blance", clan: "VW" },
  { name: "Big", clan: "Div" },
  { name: "Orthol", clan: "HC" },
  { name: "Bury", clan: "VoV" },
  { name: "Thyestes", clan: "BDCT" },
  { name: "Zuzujj", clan: "SVCI" },
  { name: "Wesh", clan: "BDCT" },
  { name: "Thorfinnn", clan: "VALE" },
  { name: "Shmek", clan: null },
  { name: "Thornton", clan: "RS" },
  { name: "Erudezu", clan: "CI" },
  { name: "fazv_", clan: "ODIN" },
  { name: "perokm", clan: null },
  { name: "crow", clan: "ND" },
  { name: "toxicosis", clan: null },
  { name: "Jeremus", clan: "AURA" },
  { name: "Apir", clan: "PNDR" },
  { name: "Ragram", clan: "Eque" },
  { name: "meowmeowmeow", clan: "IZpp" },
  { name: "GHXST", clan: "VoV" },
  { name: "Sure", clan: "Div" },
  { name: "Tengou", clan: "CFR" },
  { name: "dida", clan: "DEEN" },
  { name: "TheMoon", clan: null },
  { name: "J", clan: "ZE" },
  { name: "Arno", clan: "KUD" },
  { name: "JUDGEMENT", clan: null },
  { name: "Asediado", clan: "CI" },
  { name: "Tavyon", clan: "BDCT" },
  { name: "vargath", clan: "PNDR" },
  { name: "FLOCKA", clan: "RPGS" },
  { name: "Slogger", clan: "BDCT" },
  { name: "JackDaw", clan: null },
  { name: "Garne", clan: "CFR" },
  { name: "Alex", clan: "STIX" },
  { name: "izpp-", clan: "VALE" },
  { name: "brucokiller", clan: "BDCT" },
  { name: "Monkey", clan: "SVCI" },
  { name: "YBG", clan: null },
  { name: "Tomaszow", clan: "KoPL" },
  { name: "Erec", clan: "VALE" },
  { name: "KoZhiN", clan: null },
  { name: "Saint", clan: "CFR" },
  { name: "Ibralito", clan: "NOVLA" },
  { name: "Buzz", clan: "FOLK" },
  { name: "Szymciox", clan: "DON" },
  { name: "bolu", clan: "VALE" },
  { name: "Eerik", clan: null },
  { name: "Purostapulos", clan: "BVRA" },
  { name: "Vajiko", clan: "BDCT" },
  { name: "Emma", clan: "BDCT" },
  { name: "Svaein", clan: "KUD" },
  { name: "Kenvayt_Aim", clan: "AURA" },
  { name: "Beast", clan: "DM" },
];

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
  console.log('=== SAFE DATABASE UPDATE ===\n');
  
  // DRY RUN FIRST - Check what will happen
  console.log('--- DRY RUN: Checking what will be done ---\n');
  
  // Check new players
  let newPlayersToAdd = [];
  let existingPlayersSkipped = [];
  
  for (const p of NEW_PLAYERS) {
    const existing = await prisma.player.findUnique({ where: { name: p.name } });
    if (existing) {
      existingPlayersSkipped.push(p.name);
    } else {
      newPlayersToAdd.push(p);
    }
  }
  
  console.log(`NEW PLAYERS: ${newPlayersToAdd.length} to add, ${existingPlayersSkipped.length} already exist`);
  if (existingPlayersSkipped.length > 0) {
    console.log(`  Skipping (already exist): ${existingPlayersSkipped.join(', ')}`);
  }
  
  // Check clan updates
  let clanUpdatesToApply = [];
  let clanUpdatesNotFound = [];
  
  for (const u of CLAN_UPDATES) {
    const existing = await prisma.player.findUnique({ where: { name: u.name } });
    if (existing) {
      clanUpdatesToApply.push({ ...u, currentClan: existing.clan });
    } else {
      clanUpdatesNotFound.push(u.name);
    }
  }
  
  console.log(`CLAN UPDATES: ${clanUpdatesToApply.length} to update, ${clanUpdatesNotFound.length} not found`);
  if (clanUpdatesNotFound.length > 0) {
    console.log(`  Not found: ${clanUpdatesNotFound.join(', ')}`);
  }
  
  console.log('\n--- APPLYING CHANGES ---\n');
  
  // TRANSACTION: Apply all changes safely
  await prisma.$transaction(async (tx) => {
    // 1. Add new players
    let addedCount = 0;
    for (const p of newPlayersToAdd) {
      await tx.player.create({
        data: {
          name: p.name,
          category: 'INFANTRY',
          clan: p.clan,
        }
      });
      addedCount++;
      console.log(`  ✅ Added: ${p.name} (clan: ${p.clan || 'none'})`);
    }
    console.log(`\nAdded ${addedCount} new players.\n`);
    
    // 2. Update clans
    let updatedCount = 0;
    for (const u of clanUpdatesToApply) {
      await tx.player.update({
        where: { name: u.name },
        data: { clan: u.newClan }
      });
      updatedCount++;
      console.log(`  🔄 Updated: ${u.name} (${u.currentClan} → ${u.newClan})`);
    }
    console.log(`\nUpdated ${updatedCount} player clans.\n`);
  });
  
  console.log('=== UPDATE COMPLETE ===');
  console.log(`Total: ${newPlayersToAdd.length} added, ${clanUpdatesToApply.length} clan updates`);
}

main()
  .catch((e) => {
    console.error('ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



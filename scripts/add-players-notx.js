const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// NEW PLAYERS TO ADD - Default to INFANTRY
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

async function main() {
  console.log('=== ADDING NEW PLAYERS (no transaction) ===\n');
  
  let addedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const p of NEW_PLAYERS) {
    try {
      // Check if exists first
      const existing = await prisma.player.findUnique({ where: { name: p.name } });
      if (existing) {
        console.log(`⏭️  Skipped (exists): ${p.name}`);
        skippedCount++;
        continue;
      }
      
      // Add player
      await prisma.player.create({
        data: {
          name: p.name,
          category: 'INFANTRY',
          clan: p.clan,
        }
      });
      console.log(`✅ Added: ${p.name} (clan: ${p.clan || 'none'})`);
      addedCount++;
    } catch (e) {
      console.log(`❌ Error adding ${p.name}: ${e.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n=== COMPLETE ===`);
  console.log(`Added: ${addedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



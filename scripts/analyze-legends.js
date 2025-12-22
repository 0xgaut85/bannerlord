const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// FIRST LIST: Legends to add (only if not existing as non-legends)
const LEGENDS_TO_ADD = [
  { name: "Einar", category: "ARCHER", nationality: "NO" },
  { name: "Bard", category: "INFANTRY", nationality: "DE" },
  { name: "Keykuu", category: "CAVALRY", nationality: "TR" },
  { name: "Horatius", category: "INFANTRY", nationality: "RU" },
  { name: "Perseus", category: "CAVALRY", nationality: "TR" },
  { name: "Forsee", category: "ARCHER", nationality: "RU" },
  { name: "Tryerror", category: "INFANTRY", nationality: "TR" },
  { name: "Ramon", category: "INFANTRY", nationality: "RU" },
  { name: "Brumbrum", category: "INFANTRY", nationality: "LV" },
  { name: "Delonghy", category: "INFANTRY", nationality: "gb-eng" },
  { name: "NIN3", category: "INFANTRY", nationality: "DE" },
  { name: "BruXseleS", category: "CAVALRY", nationality: "BE" },
  { name: "OGL", category: "INFANTRY", nationality: "DE" },
  { name: "Eder", category: "INFANTRY", nationality: "DE" },
  { name: "CuChulainn", category: "CAVALRY", nationality: "IE" },
  { name: "Ghazi", category: "CAVALRY", nationality: "PL" },
  { name: "Teugata", category: "INFANTRY", nationality: "BE" },
];

// Parse all entries from the massive list - each unique name with final category
// When multiple categories (e.g. "Infantry/Cavalry"), pick first one
// "Captain" → INFANTRY, "Any"/"Flex" → INFANTRY
function pickCategory(cat) {
  if (!cat) return "INFANTRY";
  const c = cat.trim().toLowerCase();
  if (c.includes("duo")) return null; // skip duos
  if (c.includes("/")) {
    const first = c.split("/")[0].trim();
    return pickCategory(first);
  }
  if (c === "any" || c === "flex") return "INFANTRY";
  if (c === "captain") return "INFANTRY";
  if (c.startsWith("inf")) return "INFANTRY";
  if (c.startsWith("cav")) return "CAVALRY";
  if (c.startsWith("arc")) return "ARCHER";
  return "INFANTRY";
}

// All players from the massive list (consolidated, last occurrence wins for category)
const rawList = `
Axder	Infantry
Berry	Cavalry
Brumbrum	Infantry
Carnifex	Cavalry
CuChulainn	Cavalry
DasGinta	Archer
Dest	Infantry
Dextrus	Infantry
Elwaen	Infantry
Eder	Cavalry
Einar	Archer
ElContador	Archer
Firunien	Cavalry
Gabe	Infantry
Gareh	Infantry
Ghazi	Cavalry
Gibby	Infantry
Hairless	Infantry
Jesaja	Infantry
Jufasto	Infantry
Kazu	Infantry
Koso	Archer
Lacoste	Infantry
LeJew	Infantry
Nikola	Archer
Nin3	Infantry
Nordwolf	Infantry
Obelix	Infantry
OGL	Infantry
OneClips	Infantry
Pacemaker	Infantry
Perseus	Cavalry
Popowicz	Archer
Quadri	Archer
Ramon	Cavalry
Rangah	Cavalry
Relexan	Cavalry
Relynar	Archer
Riflex	Archer
Scherdinger	Infantry
Sharky	Infantry
Silver	Infantry
Sindarin	Cavalry
Teugata	Infantry
Varadog	Infantry
Walker	Cavalry
Woj	Cavalry
Xann	Infantry
Zarask	Infantry
Zettaiken	Infantry
Zipp0	Infantry
Livso	Cavalry
Argentum	Infantry
Arglaxx	Archer
Hoonii	Cavalry
Lars	Cavalry
Artemeis	Infantry
Delonghy	Infantry
SJC	Infantry
Dovmont	Infantry
Gotha	Infantry
MetalLucas	Infantry
Varadin	Infantry
Forsee	Archer
Hisoka	Infantry
Aela	Cavalry
Wegnas	Archer
Kwenthrith	Infantry
zorkeN	Infantry
Xanno	Infantry
Troechka	Cavalry
Firates	Cavalry
SidWolf	Cavalry
Mazewind	Infantry
Daban	Infantry
Arkaruld	Infantry
Gellert	Infantry
koda	Infantry
hireling	Infantry
JaximusFate	Archer
berry	Cavalry
Eduard	Infantry
Keyku	Cavalry
kawaii	Cavalry
Kratzz	Archer
Svenneld	Infantry
MetalLuca	Infantry
Zdichu	Infantry
Bertalicious	Archer
Jymy175	Infantry
Lucon	Cavalry
feodras	Infantry
Maxxxio	Archer
Runcop	Infantry
Dark	Cavalry
1or3	Archer
Alim	Archer
DonNeto	Cavalry
Zdzichu	Infantry
Einar	Archer
gellert	Infantry
Orpsel	Cavalry
Haldir	Cavalry
Maxy	Infantry
Neyth	Infantry
Pawiu	Infantry
Kripaz	Infantry
Walja	Infantry
AnrgyNerd	Infantry
ONeil	Infantry
Tom54p	Infantry
Ganni	Infantry
Blue_Owl	Cavalry
Hodor	Infantry
Rus_Politeh	Infantry
Nord	Archer
Sindarin	Cavalry
krisee	Infantry
lars	Cavalry
troechka	Cavalry
warcat	Infantry
xanno	Infantry
artemis	Infantry
st1myil	Cavalry
death	Infantry
tom54	Infantry
shredinger	Infantry
hairless	Infantry
nord	Infantry
axder	Infantry
blackdevil	Infantry
elwaen	Cavalry
ghazi	Cavalry
woj	Cavalry
ricardo	Infantry
thegioman	Infantry
nin3	Cavalry
gellert	Infantry
zorken	Infantry
varadin	Infantry
horatius	Infantry
sunny	Archer
oneclips	Infantry
lejew	Infantry
atobaking	Infantry
nova	Archer
runcop	Cavalry
cosimo	Infantry
donneto	Cavalry
longinus	Archer
keyku	Cavalry
aela	Cavalry
popo	Archer
maxy	Archer
livso	Cavalry
tota	Infantry
langelau	Archer
haldir	Cavalry
relexan	Cavalry
dovmont	Infantry
redwar	Archer
jaximus	Archer
georgito	Infantry
Death	Infantry
Bard	Infantry
Entral	Cavalry
Sunny	Archer
Diabelek	Infantry
Schredinger	Infantry
TheGioMan	Infantry
Red_War	Archer
Scaffolding	Infantry
Artemeis	Infantry
Adderal	Infantry
Hideyoshi	Archer
Klees	Infantry
Beast	Infantry
Axder	Cavalry
Indar	Cavalry
Krisee	Infantry
Roman	Cavalry
Lammelot	Infantry
Ritter	Infantry
Demochi	Infantry
BruXseleS	Infantry
Shema	Cavalry
Levilop	Infantry
Georgitto	Archer
aCe	Infantry
Andrew	Archer
Authari	Infantry
Ondine	Infantry
Kassia	Infantry
BD	Infantry
Gratorix	Infantry
Bruxseles	Cavalry
Lord	Infantry
Aiku	Archer
Angel	Cavalry
Launi	Cavalry
Mono	Infantry
Para	Infantry
Biggus	Infantry
Frodo	Infantry
Jacxson	Infantry
Calabath	Infantry
Raichu	Infantry
Nutella	Infantry
Domcio	Infantry
Volv	Infantry
Daburon	Archer
Vor4yn	Cavalry
Ze	Infantry
Vuelza	Cavalry
Rigo	Cavalry
Siberia	Cavalry
Enter	Infantry
Gwynbleidd	Infantry
Hemsworth	Cavalry
Xanno	Archer
Andros	Cavalry
Pina	Archer
Odin	Cavalry
Paex	Infantry
Horaz	Infantry
Snek	Infantry
Zenepl	Infantry
Aesten	Archer
Camm15elbe	Infantry
Joker	Infantry
Beano	Archer
Ftag15	Infantry
Tomkin	Infantry
Markus	Infantry
Ghostopo	Infantry
Alsandair	Infantry
Kenny	Infantry
Jaximus	Archer
gobou	Infantry
derGraf	Infantry
Feodras	Infantry
Thyrell	Infantry
ElRomano05	Cavalry
James	Cavalry
Authari	Infantry
Arni	Infantry
Gotha	Infantry
MrAsh	Infantry
Cosimo	Infantry
Hisoka	Infantry
Kamby	Infantry
Klees	Infantry
Gioman	Infantry
Horaz	Infantry
Ondine	Infantry
Dest	Infantry
RusPoliteh	Infantry
Chuckster	Infantry
Messius	Infantry
CoolBreeze	Infantry
MeanOutlaw	Infantry
Paralyzer	Infantry
Mabella	Infantry
Mert	Infantry
Vemon	Infantry
Nightwing	Infantry
Redax	Infantry
Lahir	Infantry
ZeSultan	Infantry
Herishey	Infantry
Kilian	Infantry
qwueser	Infantry
Popowicz	Archer
Sunny	Archer
Wonders	Archer
Tom54p	Archer
Quadri	Archer
Maximou	Archer
Aesten	Archer
Daburon	Archer
Gudvin	Archer
TaiLopez	Archer
Kenny	Archer
Ronaldinho	Cavalry
Siberia	Cavalry
Andros	Cavalry
Relexan	Cavalry
Roman	Cavalry
CZ	Cavalry
Aela	Cavalry
Walker	Cavalry
Elwaen	Cavalry
Longinus	Cavalry
Hireling	Cavalry
Sidwolf	Cavalry
Sunday	Cavalry
Ghxst	Cavalry
Camm15elbe	Cavalry
Karatak	Cavalry
Sturgeon	Cavalry
Vicente	Cavalry
Hispano	Cavalry
Florel	Cavalry
Smyky	Cavalry
Kume	Cavalry
Anko	Cavalry
Kurac	Cavalry
Jakhline	Infantry
Raayu	Infantry
Indikolit	Cavalry
Scherdinger	Infantry
Sonny	Cavalry
Bunny	Cavalry
Baba	Infantry
Neena	Cavalry
Albie	Cavalry
TheRealPablo	Archer
Firunien	Cavalry
Ratman	Cavalry
Azrael	Infantry
`;

// Parse and consolidate
const players = {};
for (const line of rawList.trim().split('\n')) {
  if (!line.trim()) continue;
  const parts = line.split('\t');
  if (parts.length < 2) continue;
  let name = parts[0].trim();
  const cat = parts[1].trim();
  
  // Skip duos
  if (cat.toLowerCase().includes('duo')) continue;
  if (name.includes('&')) continue;
  if (name.includes('(')) name = name.split('(')[0].trim();
  
  const category = pickCategory(cat);
  if (category) {
    // Normalize name for lookup but keep original casing
    players[name.toLowerCase()] = { name, category };
  }
}

async function main() {
  // Get current DB players
  const dbPlayers = await prisma.player.findMany({
    select: { name: true, isLegend: true, category: true }
  });
  
  const dbMap = {};
  for (const p of dbPlayers) {
    dbMap[p.name.toLowerCase()] = p;
  }
  
  console.log("=== LEGENDS TO ADD (if not existing as non-legend) ===\n");
  const legendsToCreate = [];
  for (const leg of LEGENDS_TO_ADD) {
    const existing = dbMap[leg.name.toLowerCase()];
    if (existing) {
      if (existing.isLegend) {
        console.log(`⏭️  ${leg.name} - already a legend, SKIP`);
      } else {
        console.log(`⏭️  ${leg.name} - exists as non-legend, SKIP (already in DB)`);
      }
    } else {
      console.log(`✅ ${leg.name} - ${leg.category} (${leg.nationality || 'EU'}) → WILL ADD as legend`);
      legendsToCreate.push(leg);
    }
  }
  
  console.log("\n=== PLAYERS FROM BIG LIST ===\n");
  
  const toCreate = [];
  const toUpdate = [];
  
  for (const key of Object.keys(players).sort()) {
    const p = players[key];
    const existing = dbMap[key];
    
    if (!existing) {
      toCreate.push(p);
    } else if (existing.category !== p.category && !existing.isLegend) {
      toUpdate.push({ name: existing.name, oldCat: existing.category, newCat: p.category });
    }
  }
  
  console.log("--- NEW PLAYERS TO ADD ---");
  if (toCreate.length === 0) {
    console.log("None");
  } else {
    for (const p of toCreate) {
      console.log(`➕ ${p.name} - ${p.category}`);
    }
  }
  
  console.log("\n--- CATEGORY UPDATES ---");
  if (toUpdate.length === 0) {
    console.log("None");
  } else {
    for (const p of toUpdate) {
      console.log(`🔄 ${p.name}: ${p.oldCat} → ${p.newCat}`);
    }
  }
  
  console.log("\n=== SUMMARY ===");
  console.log(`Legends to add: ${legendsToCreate.length}`);
  console.log(`New players to add: ${toCreate.length}`);
  console.log(`Category updates: ${toUpdate.length}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);


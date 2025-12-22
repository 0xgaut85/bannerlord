const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Parse category - pick first if multiple, map Captain/Any/Flex to INFANTRY
function pickCategory(cat) {
  if (!cat) return "INFANTRY";
  const c = cat.trim().toLowerCase();
  if (c.includes("duo")) return null;
  if (c.includes("/")) return pickCategory(c.split("/")[0].trim());
  if (c === "any" || c === "flex") return "INFANTRY";
  if (c === "captain") return "INFANTRY";
  if (c.startsWith("inf")) return "INFANTRY";
  if (c.startsWith("cav")) return "CAVALRY";
  if (c.startsWith("arc")) return "ARCHER";
  return "INFANTRY";
}

// ALL players from user's list - these are ALL legends
const rawEntries = `
einar,arc,NO
bard,inf,DE
keykuu,cav,TR
horatius,inf,RU
perseus,cav,TR
forsee,arc,RU
tryerror,inf,TR
ramon,inf,RU
brumbrum,inf,LV
delonghy,inf,gb-eng
NIN3,inf,DE
bruxseles,cav,BE
OGL,inf,DE
eder,inf,DE
CuChulainn,cav,IE
ghazi,cav,PL
teugata,inf,BE
Axder,Infantry
Berry,Cavalry
Brumbrum,Infantry
Carnifex,Cavalry
CuChulainn,Cavalry
DasGinta,Archer
Dest,Infantry
Dextrus,Infantry
Elwaen,Infantry
Eder,Cavalry
Einar,Archer
ElContador,Archer
Firunien,Cavalry
Gabe,Infantry
Gareh,Infantry
Ghazi,Cavalry
Gibby,Infantry
Hairless,Infantry
Jesaja,Infantry
Jufasto,Infantry
Kazu,Infantry
Koso,Archer
Lacoste,Infantry
LeJew,Infantry
Nikola,Archer
Nin3,Infantry
Nordwolf,Infantry
Obelix,Infantry
OGL,Infantry
OneClips,Infantry
Pacemaker,Infantry
Perseus,Cavalry
Popowicz,Archer
Quadri,Archer
Ramon,Cavalry
Rangah,Cavalry
Relexan,Cavalry
Relynar,Archer
Riflex,Archer
Scherdinger,Infantry
Sharky,Infantry
Silver,Infantry
Sindarin,Cavalry
Teugata,Infantry
Varadog,Infantry
Walker,Cavalry
Woj,Cavalry
Xann,Infantry
Zarask,Infantry
Zettaiken,Infantry
Zipp0,Infantry
Livso,Cavalry
Argentum,Infantry
Arglaxx,Archer
Hoonii,Cavalry
Lars,Cavalry
Artemeis,Infantry
Delonghy,Infantry
SJC,Infantry
Dovmont,Infantry
Gotha,Infantry
MetalLucas,Infantry
Varadin,Infantry
Forsee,Archer
Hisoka,Infantry
Aela,Cavalry
Wegnas,Archer
Kwenthrith,Infantry
zorkeN,Infantry
Xanno,Infantry
Troechka,Cavalry
Firates,Cavalry
SidWolf,Cavalry
Mazewind,Infantry
Daban,Infantry
Arkaruld,Infantry
Gellert,Infantry
koda,Infantry
hireling,Infantry
JaximusFate,Archer
Berry,Cavalry
Eduard,Infantry
Keykuu,Cavalry
kawaii,Cavalry
Kratzz,Archer
Svenneld,Infantry
MetalLuca,Infantry
Zdichu,Infantry
Bertalicious,Archer
Jymy175,Infantry
Lucon,Cavalry
feodras,Infantry
Maxxxio,Archer
Runcop,Infantry
Dark,Cavalry
1or3,Archer
Alim,Archer
DonNeto,Cavalry
Zdzichu,Infantry
Gellert,Infantry
Orpsel,Cavalry
Haldir,Cavalry
Maxy,Infantry
Neyth,Infantry
Pawiu,Infantry
Kripaz,Infantry
Walja,Infantry
AnrgyNerd,Infantry
ONeil,Infantry
Tom54p,Infantry
Ganni,Infantry
Blue_Owl,Cavalry
Hodor,Infantry
Rus_Politeh,Infantry
Nord,Archer
krisee,Infantry
warcat,Infantry
st1myil,Cavalry
death,Infantry
shredinger,Infantry
hairless,Infantry
axder,Infantry
blackdevil,Infantry
ricardo,Infantry
thegioman,Infantry
horatius,Infantry
sunny,Archer
oneclips,Infantry
atobaking,Infantry
nova,Archer
runcop,Cavalry
cosimo,Infantry
donneto,Cavalry
longinus,Archer
popo,Archer
maxy,Archer
tota,Infantry
langelau,Archer
dovmont,Infantry
redwar,Archer
jaximus,Archer
georgito,Infantry
Death,Infantry
Bard,Infantry
Entral,Cavalry
Diabelek,Infantry
Schredinger,Infantry
TheGioMan,Infantry
Red_War,Archer
Scaffolding,Infantry
Adderal,Infantry
Hideyoshi,Archer
Klees,Infantry
Beast,Infantry
Indar,Cavalry
Roman,Cavalry
Lammelot,Infantry
Demochi,Infantry
Shema,Cavalry
Levilop,Infantry
Georgitto,Archer
aCe,Infantry
Andrew,Archer
Authari,Infantry
Ondine,Infantry
Kassia,Infantry
BD,Infantry
Gratorix,Infantry
Lord,Infantry
Aiku,Archer
Angel,Cavalry
Launi,Cavalry
Mono,Infantry
Para,Infantry
Biggus,Infantry
Frodo,Infantry
Jacxson,Infantry
Calabath,Infantry
Raichu,Infantry
Nutella,Infantry
Domcio,Infantry
Volv,Infantry
Daburon,Archer
Vor4yn,Cavalry
Vuelza,Cavalry
Rigo,Cavalry
Siberia,Cavalry
Enter,Infantry
Gwynbleidd,Infantry
Hemsworth,Cavalry
Odin,Cavalry
Paex,Infantry
Horaz,Infantry
Snek,Infantry
Zenepl,Infantry
Aesten,Archer
Camm15elbe,Infantry
Joker,Infantry
Beano,Archer
Ftag15,Infantry
Tomkin,Infantry
Markus,Infantry
Ghostopo,Infantry
Alsandair,Infantry
Kenny,Archer
gobou,Infantry
derGraf,Infantry
Feodras,Infantry
Thyrell,Infantry
ElRomano05,Cavalry
MrAsh,Infantry
Cosimo,Infantry
Kamby,Infantry
Gioman,Infantry
Chuckster,Infantry
Messius,Infantry
CoolBreeze,Infantry
MeanOutlaw,Infantry
Paralyzer,Infantry
Mabella,Infantry
Mert,Infantry
Vemon,Infantry
Nightwing,Infantry
Redax,Infantry
Lahir,Infantry
ZeSultan,Infantry
Herishey,Infantry
Kilian,Infantry
qwueser,Infantry
Wonders,Archer
Maximou,Archer
Gudvin,Archer
TaiLopez,Archer
Ronaldinho,Cavalry
CZ,Cavalry
Elwaen,Cavalry
Hireling,Cavalry
Sunday,Cavalry
Ghxst,Cavalry
Karatak,Cavalry
Sturgeon,Cavalry
Vicente,Cavalry
Hispano,Cavalry
Florel,Cavalry
Smyky,Cavalry
Kume,Cavalry
Anko,Cavalry
Kurac,Cavalry
Jakhline,Infantry
Raayu,Infantry
Indikolit,Cavalry
Sonny,Cavalry
Bunny,Cavalry
Baba,Infantry
Neena,Cavalry
Albie,Cavalry
TheRealPablo,Archer
Ratman,Cavalry
Azrael,Infantry
Ritter,Infantry
`;

// Parse all entries and consolidate by lowercase name (last one wins)
const legendsMap = {};
for (const line of rawEntries.trim().split('\n')) {
  if (!line.trim()) continue;
  
  let name, catStr, nationality = null;
  
  // Check if it's comma-separated (first format) or tab-separated
  if (line.includes(',')) {
    const parts = line.split(',');
    name = parts[0].trim();
    catStr = parts[1]?.trim() || "Infantry";
    nationality = parts[2]?.trim() || null;
  } else if (line.includes('\t')) {
    const parts = line.split('\t');
    name = parts[0].trim();
    catStr = parts[1]?.trim() || "Infantry";
  } else {
    continue;
  }
  
  // Skip duos and names with &
  if (catStr.toLowerCase().includes('duo')) continue;
  if (name.includes('&')) continue;
  if (name.includes('(')) name = name.split('(')[0].trim();
  
  const category = pickCategory(catStr);
  if (!category) continue;
  
  const key = name.toLowerCase();
  // Update or create entry
  if (!legendsMap[key]) {
    legendsMap[key] = { name, category, nationality };
  } else {
    // Keep first name casing, update category, keep nationality if exists
    legendsMap[key].category = category;
    if (nationality) legendsMap[key].nationality = nationality;
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
  
  const toAdd = [];
  const skipped = [];
  
  for (const key of Object.keys(legendsMap).sort()) {
    const leg = legendsMap[key];
    const existing = dbMap[key];
    
    if (existing) {
      if (existing.isLegend) {
        skipped.push({ name: leg.name, reason: "already a legend" });
      } else {
        skipped.push({ name: leg.name, reason: "exists as normal player" });
      }
    } else {
      toAdd.push(leg);
    }
  }
  
  console.log("=== LEGENDS TO ADD ===\n");
  console.log("Name\t\t\t\tCategory\tFlag");
  console.log("----\t\t\t\t--------\t----");
  for (const p of toAdd) {
    const namePad = p.name.padEnd(24);
    const catPad = p.category.padEnd(12);
    console.log(`${namePad}${catPad}${p.nationality || 'EU'}`);
  }
  console.log(`\nTotal to add: ${toAdd.length}`);
  
  console.log("\n=== SKIPPED (already in DB) ===\n");
  for (const s of skipped) {
    console.log(`⏭️  ${s.name} - ${s.reason}`);
  }
  console.log(`\nTotal skipped: ${skipped.length}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);


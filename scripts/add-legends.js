const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 151 legends to add (excluded: Varadog, shredinger, Relexan, Popowicz, Ondine, MetalLuca, Hemsworth)
const LEGENDS = [
  { name: "1or3", category: "ARCHER", nationality: null },
  { name: "aCe", category: "INFANTRY", nationality: null },
  { name: "Adderal", category: "INFANTRY", nationality: null },
  { name: "Alim", category: "ARCHER", nationality: null },
  { name: "Andrew", category: "ARCHER", nationality: null },
  { name: "Anko", category: "CAVALRY", nationality: null },
  { name: "AnrgyNerd", category: "INFANTRY", nationality: null },
  { name: "Arglaxx", category: "ARCHER", nationality: null },
  { name: "Arkaruld", category: "INFANTRY", nationality: null },
  { name: "Artemeis", category: "INFANTRY", nationality: null },
  { name: "atobaking", category: "INFANTRY", nationality: null },
  { name: "Baba", category: "INFANTRY", nationality: null },
  { name: "Berry", category: "CAVALRY", nationality: null },
  { name: "Bertalicious", category: "ARCHER", nationality: null },
  { name: "Biggus", category: "INFANTRY", nationality: null },
  { name: "blackdevil", category: "INFANTRY", nationality: null },
  { name: "Blue_Owl", category: "CAVALRY", nationality: null },
  { name: "Brumbrum", category: "INFANTRY", nationality: "LV" },
  { name: "BruXseleS", category: "CAVALRY", nationality: "BE" },
  { name: "Calabath", category: "INFANTRY", nationality: null },
  { name: "CoolBreeze", category: "INFANTRY", nationality: null },
  { name: "CuChulainn", category: "CAVALRY", nationality: "IE" },
  { name: "CZ", category: "CAVALRY", nationality: null },
  { name: "Daban", category: "INFANTRY", nationality: null },
  { name: "DasGinta", category: "ARCHER", nationality: null },
  { name: "Delonghy", category: "INFANTRY", nationality: "gb-eng" },
  { name: "Demochi", category: "INFANTRY", nationality: null },
  { name: "derGraf", category: "INFANTRY", nationality: null },
  { name: "Dest", category: "INFANTRY", nationality: null },
  { name: "Diabelek", category: "INFANTRY", nationality: null },
  { name: "Domcio", category: "INFANTRY", nationality: null },
  { name: "Dovmont", category: "INFANTRY", nationality: null },
  { name: "Eder", category: "CAVALRY", nationality: "DE" },
  { name: "Eduard", category: "INFANTRY", nationality: null },
  { name: "Einar", category: "ARCHER", nationality: "NO" },
  { name: "ElContador", category: "ARCHER", nationality: null },
  { name: "Elwaen", category: "CAVALRY", nationality: null },
  { name: "Entral", category: "CAVALRY", nationality: null },
  { name: "Feodras", category: "INFANTRY", nationality: null },
  { name: "Firates", category: "CAVALRY", nationality: null },
  { name: "Florel", category: "CAVALRY", nationality: null },
  { name: "Forsee", category: "ARCHER", nationality: "RU" },
  { name: "Frodo", category: "INFANTRY", nationality: null },
  { name: "Ftag15", category: "INFANTRY", nationality: null },
  { name: "Gabe", category: "INFANTRY", nationality: null },
  { name: "Ganni", category: "INFANTRY", nationality: null },
  { name: "Gareh", category: "INFANTRY", nationality: null },
  { name: "Gellert", category: "INFANTRY", nationality: null },
  { name: "Georgito", category: "INFANTRY", nationality: null },
  { name: "Gibby", category: "INFANTRY", nationality: null },
  { name: "Gioman", category: "INFANTRY", nationality: null },
  { name: "Gratorix", category: "INFANTRY", nationality: null },
  { name: "Gwynbleidd", category: "INFANTRY", nationality: null },
  { name: "Hairless", category: "INFANTRY", nationality: null },
  { name: "Haldir", category: "CAVALRY", nationality: null },
  { name: "Hireling", category: "CAVALRY", nationality: null },
  { name: "Hisoka", category: "INFANTRY", nationality: null },
  { name: "Horatius", category: "INFANTRY", nationality: "RU" },
  { name: "Horaz", category: "INFANTRY", nationality: null },
  { name: "Indikolit", category: "CAVALRY", nationality: null },
  { name: "Jacxson", category: "INFANTRY", nationality: null },
  { name: "Jakhline", category: "INFANTRY", nationality: null },
  { name: "Jaximus", category: "ARCHER", nationality: null },
  { name: "JaximusFate", category: "ARCHER", nationality: null },
  { name: "Jesaja", category: "INFANTRY", nationality: null },
  { name: "Jymy175", category: "INFANTRY", nationality: null },
  { name: "Karatak", category: "CAVALRY", nationality: null },
  { name: "Kassia", category: "INFANTRY", nationality: null },
  { name: "Kawaii", category: "CAVALRY", nationality: null },
  { name: "Keykuu", category: "CAVALRY", nationality: "TR" },
  { name: "Klees", category: "INFANTRY", nationality: null },
  { name: "Koda", category: "INFANTRY", nationality: null },
  { name: "Kratzz", category: "ARCHER", nationality: null },
  { name: "Kripaz", category: "INFANTRY", nationality: null },
  { name: "Kume", category: "CAVALRY", nationality: null },
  { name: "Kurac", category: "CAVALRY", nationality: null },
  { name: "Kwenthrith", category: "INFANTRY", nationality: null },
  { name: "Lacoste", category: "INFANTRY", nationality: null },
  { name: "Lahir", category: "INFANTRY", nationality: null },
  { name: "Lammelot", category: "INFANTRY", nationality: null },
  { name: "Langelau", category: "ARCHER", nationality: null },
  { name: "Launi", category: "CAVALRY", nationality: null },
  { name: "Levilop", category: "INFANTRY", nationality: null },
  { name: "Lord", category: "INFANTRY", nationality: null },
  { name: "Lucon", category: "CAVALRY", nationality: null },
  { name: "Mabella", category: "INFANTRY", nationality: null },
  { name: "Markus", category: "INFANTRY", nationality: null },
  { name: "Maximou", category: "ARCHER", nationality: null },
  { name: "Maxxxio", category: "ARCHER", nationality: null },
  { name: "Maxy", category: "ARCHER", nationality: null },
  { name: "Mazewind", category: "INFANTRY", nationality: null },
  { name: "MeanOutlaw", category: "INFANTRY", nationality: null },
  { name: "Messius", category: "INFANTRY", nationality: null },
  { name: "MetalLucas", category: "INFANTRY", nationality: null },
  { name: "Neyth", category: "INFANTRY", nationality: null },
  { name: "Nikola", category: "ARCHER", nationality: null },
  { name: "NIN3", category: "INFANTRY", nationality: "DE" },
  { name: "Nordwolf", category: "INFANTRY", nationality: null },
  { name: "OGL", category: "INFANTRY", nationality: "DE" },
  { name: "ONeil", category: "INFANTRY", nationality: null },
  { name: "Paex", category: "INFANTRY", nationality: null },
  { name: "Para", category: "INFANTRY", nationality: null },
  { name: "Paralyzer", category: "INFANTRY", nationality: null },
  { name: "Pawiu", category: "INFANTRY", nationality: null },
  { name: "Perseus", category: "CAVALRY", nationality: "TR" },
  { name: "Raayu", category: "INFANTRY", nationality: null },
  { name: "Raichu", category: "INFANTRY", nationality: null },
  { name: "Ramon", category: "CAVALRY", nationality: "RU" },
  { name: "Ratman", category: "CAVALRY", nationality: null },
  { name: "Red_War", category: "ARCHER", nationality: null },
  { name: "Redax", category: "INFANTRY", nationality: null },
  { name: "Ricardo", category: "INFANTRY", nationality: null },
  { name: "Riflex", category: "ARCHER", nationality: null },
  { name: "Ronaldinho", category: "CAVALRY", nationality: null },
  { name: "Rus_Politeh", category: "INFANTRY", nationality: null },
  { name: "Scaffolding", category: "INFANTRY", nationality: null },
  { name: "Schredinger", category: "INFANTRY", nationality: null },
  { name: "Sharky", category: "INFANTRY", nationality: null },
  { name: "Shema", category: "CAVALRY", nationality: null },
  { name: "SidWolf", category: "CAVALRY", nationality: null },
  { name: "Sindarin", category: "CAVALRY", nationality: null },
  { name: "SJC", category: "INFANTRY", nationality: null },
  { name: "Snek", category: "INFANTRY", nationality: null },
  { name: "Sonny", category: "CAVALRY", nationality: null },
  { name: "St1myil", category: "CAVALRY", nationality: null },
  { name: "Sunday", category: "CAVALRY", nationality: null },
  { name: "Svenneld", category: "INFANTRY", nationality: null },
  { name: "TaiLopez", category: "ARCHER", nationality: null },
  { name: "Teugata", category: "INFANTRY", nationality: "BE" },
  { name: "Tomkin", category: "INFANTRY", nationality: null },
  { name: "Tota", category: "INFANTRY", nationality: null },
  { name: "Tryerror", category: "INFANTRY", nationality: "TR" },
  { name: "Volv", category: "INFANTRY", nationality: null },
  { name: "Vor4yn", category: "CAVALRY", nationality: null },
  { name: "Vuelza", category: "CAVALRY", nationality: null },
  { name: "Walja", category: "INFANTRY", nationality: null },
  { name: "Warcat", category: "INFANTRY", nationality: null },
  { name: "Wegnas", category: "ARCHER", nationality: null },
  { name: "Wonders", category: "ARCHER", nationality: null },
  { name: "Xann", category: "INFANTRY", nationality: null },
  { name: "Xanno", category: "INFANTRY", nationality: null },
  { name: "Zarask", category: "INFANTRY", nationality: null },
  { name: "Zdichu", category: "INFANTRY", nationality: null },
  { name: "Zdzichu", category: "INFANTRY", nationality: null },
  { name: "Zenepl", category: "INFANTRY", nationality: null },
  { name: "ZeSultan", category: "INFANTRY", nationality: null },
  { name: "Zettaiken", category: "INFANTRY", nationality: null },
  { name: "Zipp0", category: "INFANTRY", nationality: null },
  { name: "ZorkeN", category: "INFANTRY", nationality: null },
];

async function main() {
  console.log(`Adding ${LEGENDS.length} legends...\n`);
  
  let added = 0, skipped = 0, errors = 0;
  
  for (const leg of LEGENDS) {
    try {
      // Check if already exists
      const existing = await prisma.player.findFirst({
        where: { name: { equals: leg.name, mode: 'insensitive' } }
      });
      
      if (existing) {
        console.log(`⏭️  ${leg.name} - already exists, skipping`);
        skipped++;
        continue;
      }
      
      await prisma.player.create({
        data: {
          name: leg.name,
          category: leg.category,
          nationality: leg.nationality,
          isLegend: true,
        }
      });
      console.log(`✅ ${leg.name} (${leg.category}) ${leg.nationality || 'EU'}`);
      added++;
    } catch (err) {
      console.log(`❌ ${leg.name} - error: ${err.message}`);
      errors++;
    }
  }
  
  console.log(`\n=== DONE ===`);
  console.log(`Added: ${added}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


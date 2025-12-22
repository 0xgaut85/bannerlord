import { PrismaClient, PlayerCategory } from "@prisma/client"

const prisma = new PrismaClient()

// Map nationality names to ISO country codes
const nationalityMap: Record<string, string> = {
  france: "FR",
  french: "FR",
  francais: "FR",
  poland: "PL",
  german: "DE",
  germany: "DE",
  russian: "RU",
  russia: "RU",
  italy: "IT",
  belgium: "BE",
  turk: "TR",
  turkey: "TR",
  ukraine: "UA",
  scotland: "GB-SCT",
  england: "GB",
  swiss: "CH",
  switzerland: "CH",
  czech: "CZ",
  latvia: "LV",
}

// Legend players data
const legends = [
  { name: "CTH", category: "INFANTRY", nationality: "france" },
  { name: "SharZ", category: "INFANTRY", nationality: "france" },
  { name: "Woj", category: "CAVALRY", nationality: "poland" },
  { name: "Orpsel", category: "CAVALRY", nationality: "poland" },
  { name: "Bard", category: "INFANTRY", nationality: "german" },
  { name: "Dextrus", category: "INFANTRY", nationality: "german" },
  { name: "Lars", category: "CAVALRY", nationality: "german" },
  { name: "Roman", category: "CAVALRY", nationality: "german" },
  { name: "Axder", category: "INFANTRY", nationality: "poland" },
  { name: "Pacemaker", category: "INFANTRY", nationality: "poland" },
  { name: "Apriko", category: "INFANTRY", nationality: "german" },
  { name: "Ghazi", category: "CAVALRY", nationality: "poland" },
  { name: "Indar", category: "CAVALRY", nationality: "russian" },
  { name: "OneClips", category: "INFANTRY", nationality: "german" },
  { name: "Scherdinger", category: "INFANTRY", nationality: "poland" },
  { name: "Cosimo", category: "INFANTRY", nationality: "italy" },
  { name: "Hodor", category: "INFANTRY", nationality: "belgium" },
  { name: "Gobou", category: "INFANTRY", nationality: "belgium" },
  { name: "Aran", category: "CAVALRY", nationality: "turk" },
  { name: "Relynar", category: "CAVALRY", nationality: "ukraine" },
  { name: "LK_Hemsworth", category: "CAVALRY", nationality: "turk" },
  { name: "WilliamWallace", category: "INFANTRY", nationality: "scotland" },
  { name: "Sarranid", category: "INFANTRY", nationality: "francais" },
  { name: "Nord", category: "CAVALRY", nationality: "russian" },
  { name: "Argentum", category: "INFANTRY", nationality: "russia" },
  { name: "DARK", category: "CAVALRY", nationality: "french" },
  { name: "AncientLunatic", category: "CAVALRY", nationality: "england" },
  { name: "Kazu", category: "INFANTRY", nationality: "swiss" },
  { name: "HypeZ", category: "INFANTRY", nationality: "german" },
  { name: "jufasto", category: "INFANTRY", nationality: "turk" },
  { name: "livso", category: "CAVALRY", nationality: "czech" },
  { name: "rangah", category: "CAVALRY", nationality: "latvia" },
]

async function seedLegends() {
  console.log("🏆 Seeding legend players...")

  for (const legend of legends) {
    const nationalityCode = nationalityMap[legend.nationality.toLowerCase()] || legend.nationality.toUpperCase()
    
    try {
      // Check if player already exists
      const existing = await prisma.player.findUnique({
        where: { name: legend.name }
      })

      if (existing) {
        // Update to legend status
        await prisma.player.update({
          where: { name: legend.name },
          data: {
            isLegend: true,
          }
        })
        console.log(`✅ Updated ${legend.name} to legend status`)
      } else {
        // Create new legend player
        await prisma.player.create({
          data: {
            name: legend.name,
            category: legend.category as PlayerCategory,
            nationality: nationalityCode,
            isLegend: true,
          }
        })
        console.log(`✅ Created legend: ${legend.name}`)
      }
    } catch (error) {
      console.error(`❌ Error with ${legend.name}:`, error)
    }
  }

  console.log("🏆 Legend seeding complete!")
}

seedLegends()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


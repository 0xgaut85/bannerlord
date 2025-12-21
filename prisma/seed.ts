import { PrismaClient, PlayerCategory } from '@prisma/client'

const prisma = new PrismaClient()

// Player data - will be populated by user
// Format: { name: string, category: PlayerCategory, nationality: string (ISO code) }
const players: { name: string; category: PlayerCategory; nationality: string }[] = [
  // INFANTRY
  // Add infantry players here
  // Example: { name: "PlayerName", category: "INFANTRY", nationality: "FR" },
  
  // CAVALRY
  // Add cavalry players here
  // Example: { name: "PlayerName", category: "CAVALRY", nationality: "DE" },
  
  // ARCHER
  // Add archer players here
  // Example: { name: "PlayerName", category: "ARCHER", nationality: "PL" },
]

async function main() {
  console.log('Starting seed...')
  
  // Clear existing players (optional - comment out if you want to keep existing)
  await prisma.rating.deleteMany()
  await prisma.player.deleteMany()
  
  console.log('Cleared existing data')
  
  // Insert players
  for (const player of players) {
    await prisma.player.upsert({
      where: { name: player.name },
      update: {
        category: player.category,
        nationality: player.nationality,
      },
      create: {
        name: player.name,
        category: player.category,
        nationality: player.nationality,
      },
    })
    console.log(`Added/Updated: ${player.name} (${player.category})`)
  }
  
  console.log(`Seed completed! Added ${players.length} players.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



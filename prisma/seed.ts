import { PrismaClient, PlayerCategory, Division } from '@prisma/client'
import { ALL_PLAYERS } from './players-data'

const prisma = new PrismaClient()

// Base users to provide initial ratings
// We need enough raters to provide at least 5 ratings per player
const BASE_RATERS = [
  { name: "System_A1", division: "A" },
  { name: "System_A2", division: "A" },
  { name: "System_A3", division: "A" },
  { name: "System_A4", division: "A" },
  { name: "System_A5", division: "A" },
  { name: "System_B1", division: "B" },
  { name: "System_B2", division: "B" },
]

async function main() {
  console.log('Start seeding...')

  // 1. Create System Raters to ensure players have initial ratings
  const raters = []
  for (const rater of BASE_RATERS) {
    const user = await prisma.user.upsert({
      where: { discordId: `system_${rater.name}` },
      update: {},
      create: {
        name: rater.name,
        discordId: `system_${rater.name}`,
        division: rater.division as Division,
        isProfileComplete: true,
      },
    })
    raters.push(user)
  }
  
  console.log(`Created ${raters.length} system raters`)

  // 2. Create Players and add ratings
  let count = 0
  
  for (const p of ALL_PLAYERS) {
    // Ensure category matches enum
    const category = p.category as PlayerCategory
    
    const player = await prisma.player.upsert({
      where: { name: p.name },
      update: {
        category: category,
        clan: p.clan,
      },
      create: {
        name: p.name,
        category: category,
        clan: p.clan,
      },
    })
    
    // Add 5 ratings for each player (required to show in global ranking)
    // We vary the score slightly around the base rating (e.g. 85 ± 1) to look natural
    // but keep average exactly or very close to target
    
    const scores = [p.rating, p.rating, p.rating + 1, p.rating - 1, p.rating]
    
    for (let i = 0; i < 5; i++) {
      const rater = raters[i % raters.length] // Cycle through raters
      await prisma.rating.upsert({
        where: {
          raterId_playerId: {
            raterId: rater.id,
            playerId: player.id,
          }
        },
        update: {
          score: scores[i]
        },
        create: {
          raterId: rater.id,
          playerId: player.id,
          score: scores[i],
        },
      })
    }
    
    count++
    if (count % 10 === 0) {
      console.log(`Processed ${count} players...`)
    }
  }

  console.log(`Seeding finished. Processed ${count} players in total.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

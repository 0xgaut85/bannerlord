const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Checking database state...\n")
    
    // Check players
    const playerCount = await prisma.player.count()
    console.log(`Players: ${playerCount}`)
    
    // Check ratings
    const ratingCount = await prisma.rating.count()
    console.log(`Ratings: ${ratingCount}`)
    
    // Check users
    const userCount = await prisma.user.count()
    console.log(`Users: ${userCount}`)
    
    // Check historical rankings
    const periodCount = await prisma.rankingPeriod.count()
    const historicalCount = await prisma.historicalRanking.count()
    console.log(`Historical Periods: ${periodCount}`)
    console.log(`Historical Rankings: ${historicalCount}`)
    
    if (periodCount > 0) {
      const periods = await prisma.rankingPeriod.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
      console.log("\nRecent periods:")
      periods.forEach(p => console.log(`  - ${p.name} (${p.createdAt})`))
    }
    
    // Check if we can recover player names from historical data
    if (historicalCount > 0) {
      const uniquePlayers = await prisma.historicalRanking.findMany({
        distinct: ['playerName'],
        select: { playerName: true, category: true, clan: true, nationality: true }
      })
      console.log(`\nUnique players in history: ${uniquePlayers.length}`)
      if (uniquePlayers.length > 0 && uniquePlayers.length < 20) {
        console.log("Player names:", uniquePlayers.map(p => p.playerName).join(", "))
      }
    }
    
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()


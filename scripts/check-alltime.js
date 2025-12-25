const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Check historical rankings
  const historicalRankings = await prisma.historicalRanking.findMany({
    take: 10,
    orderBy: { averageRating: 'desc' },
    include: {
      period: { select: { name: true } }
    }
  })
  
  console.log('=== Top 10 Historical Rankings ===')
  for (const r of historicalRankings) {
    console.log(`${r.playerName}: ${r.averageRating} (${r.period.name})`)
  }
  
  // Check legends
  console.log('\n=== Legends ===')
  const legends = await prisma.player.findMany({
    where: { isLegend: true },
    take: 10,
    include: {
      ratings: {
        include: {
          rater: { select: { division: true, discordId: true } }
        }
      }
    }
  })
  
  const DIVISION_WEIGHTS = {
    'A': 1.0,
    'B': 0.8,
    'C': 0.5,
    'D': 0.3,
    'E': 0.15,
    'F+': 0.075,
  }
  
  for (const legend of legends) {
    const realRatings = legend.ratings.filter(r => !r.rater.discordId?.startsWith('system_'))
    
    if (realRatings.length > 0) {
      let weightedSum = 0
      let totalWeight = 0
      for (const r of realRatings) {
        const weight = r.rater.division ? DIVISION_WEIGHTS[r.rater.division] : 0.075
        weightedSum += r.score * weight
        totalWeight += weight
      }
      const weightedAvg = totalWeight > 0 ? weightedSum / totalWeight : 0
      console.log(`${legend.name}: ${realRatings.length} ratings, weighted avg: ${weightedAvg.toFixed(1)}`)
    } else {
      console.log(`${legend.name}: no ratings`)
    }
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)


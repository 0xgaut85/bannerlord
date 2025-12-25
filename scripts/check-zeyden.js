const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const zeyden = await prisma.player.findFirst({
    where: { name: { contains: 'Zeyden', mode: 'insensitive' } },
    include: {
      ratings: {
        include: {
          rater: {
            select: { name: true, discordId: true, division: true }
          }
        }
      }
    }
  })
  
  console.log('Zeyden player:', JSON.stringify(zeyden, null, 2))
  
  if (zeyden && zeyden.ratings.length > 0) {
    console.log('\n--- Ratings breakdown ---')
    for (const r of zeyden.ratings) {
      console.log(`Score: ${r.score}, Rater: ${r.rater.name || r.rater.discordId}, Division: ${r.rater.division}`)
    }
    
    // Calculate weighted average
    const DIVISION_WEIGHTS = {
      'A': 1.0,
      'B': 0.8,
      'C': 0.5,
      'D': 0.3,
      'E': 0.15,
      'F+': 0.075,
    }
    
    const realRatings = zeyden.ratings.filter(r => !r.rater.discordId?.startsWith('system_'))
    console.log('\n--- Real ratings (excluding system) ---')
    let weightedSum = 0
    let totalWeight = 0
    for (const r of realRatings) {
      const weight = r.rater.division ? DIVISION_WEIGHTS[r.rater.division] : 0.075
      weightedSum += r.score * weight
      totalWeight += weight
      console.log(`Score: ${r.score}, Division: ${r.rater.division || 'none'}, Weight: ${weight}`)
    }
    
    const weightedAvg = totalWeight > 0 ? weightedSum / totalWeight : 0
    console.log(`\nWeighted sum: ${weightedSum}`)
    console.log(`Total weight: ${totalWeight}`)
    console.log(`Weighted average: ${weightedAvg}`)
    console.log(`Rounded: ${Math.round(weightedAvg * 10) / 10}`)
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)

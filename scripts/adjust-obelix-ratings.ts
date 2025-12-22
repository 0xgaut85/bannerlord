import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const playerName = "Obelix"
  const adjustment = 2

  console.log(`Finding player "${playerName}"...`)

  // Find the player
  const player = await prisma.player.findUnique({
    where: { name: playerName },
    include: {
      ratings: true,
    },
  })

  if (!player) {
    console.error(`Player "${playerName}" not found`)
    process.exit(1)
  }

  if (player.ratings.length === 0) {
    console.error(`Player "${playerName}" has no ratings`)
    process.exit(1)
  }

  console.log(`Found player with ${player.ratings.length} ratings`)
  console.log("Updating ratings...")

  // Update all ratings
  const results = []
  let updatedCount = 0

  for (const rating of player.ratings) {
    const newScore = rating.score + adjustment
    
    // Ensure score stays within valid range (50-99)
    let finalScore = newScore
    if (newScore < 50) {
      finalScore = 50
      console.log(`  Rating ${rating.id}: ${rating.score} -> ${finalScore} (capped at min)`)
    } else if (newScore > 99) {
      finalScore = 99
      console.log(`  Rating ${rating.id}: ${rating.score} -> ${finalScore} (capped at max)`)
    } else {
      console.log(`  Rating ${rating.id}: ${rating.score} -> ${finalScore}`)
    }

    await prisma.rating.update({
      where: { id: rating.id },
      data: { score: finalScore },
    })

    results.push({
      ratingId: rating.id,
      oldScore: rating.score,
      newScore: finalScore,
    })
    updatedCount++
  }

  console.log(`\n✅ Successfully updated ${updatedCount} ratings for "${playerName}"`)
  console.log(`   Adjustment: +${adjustment}`)
  console.log(`   Total ratings: ${player.ratings.length}`)
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


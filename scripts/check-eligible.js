const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const MIN_RATINGS = {
  INFANTRY: 15,
  CAVALRY: 10,
  ARCHER: 5,
}

async function main() {
  // Get all users who rated Zeyden
  const raterIds = [
    'cmjh7uxtf0kott6xmv3c0n37c', // bottomlesscasualcruelty
    'cmjh2f0cs000ct6xml190lsvk', // quadrihinq
    'cmjh0klqo01cvwszqzbt7jlxp', // senseiobelix
    'cmjh6k70c0jt6t6xmxnjb6bir', // rigo53
    'cmjjzig2j0000kviu0i11dnpg', // topandi
  ]
  
  for (const raterId of raterIds) {
    const user = await prisma.user.findUnique({
      where: { id: raterId },
      select: {
        id: true,
        name: true,
        discordName: true,
        discordId: true,
        isProfileComplete: true,
        ratings: {
          select: {
            player: {
              select: { category: true }
            }
          }
        }
      }
    })
    
    if (user) {
      const infantryCount = user.ratings.filter(r => r.player.category === 'INFANTRY').length
      const cavalryCount = user.ratings.filter(r => r.player.category === 'CAVALRY').length
      const archerCount = user.ratings.filter(r => r.player.category === 'ARCHER').length
      
      const isEligible = 
        infantryCount >= MIN_RATINGS.INFANTRY &&
        cavalryCount >= MIN_RATINGS.CAVALRY &&
        archerCount >= MIN_RATINGS.ARCHER
      
      console.log(`\n${user.name || user.discordName}:`)
      console.log(`  isProfileComplete: ${user.isProfileComplete}`)
      console.log(`  Infantry: ${infantryCount}/${MIN_RATINGS.INFANTRY}`)
      console.log(`  Cavalry: ${cavalryCount}/${MIN_RATINGS.CAVALRY}`)
      console.log(`  Archer: ${archerCount}/${MIN_RATINGS.ARCHER}`)
      console.log(`  Is Eligible: ${isEligible}`)
    }
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)


const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Base users to provide initial ratings
const BASE_RATERS = [
  { name: "System_A1", division: "A" },
  { name: "System_A2", division: "A" },
  { name: "System_A3", division: "A" },
  { name: "System_A4", division: "A" },
  { name: "System_A5", division: "A" },
  { name: "System_B1", division: "B" },
  { name: "System_B2", division: "B" },
]

const PLAYERS_A = [
  // Cavalry
  { name: "Inspire", category: "CAVALRY", clan: "RPGS", rating: 85 },
  { name: "Popo", category: "CAVALRY", clan: "IE", rating: 85 },
  { name: "Siberia", category: "CAVALRY", clan: "VW", rating: 85 },
  { name: "Mimieux", category: "CAVALRY", clan: "IE", rating: 85 },
  { name: "Reg", category: "CAVALRY", clan: "IE2", rating: 85 },
  { name: "troechka", category: "CAVALRY", clan: "RPGS", rating: 85 },
  { name: "Kajzer", category: "CAVALRY", clan: "KoPL", rating: 85 },
  { name: "chupapi", category: "CAVALRY", clan: "Div", rating: 85 },
  { name: "Firunien", category: "CAVALRY", clan: "Div", rating: 85 },
  { name: "Authari", category: "CAVALRY", clan: "VW", rating: 85 },
  { name: "Qaxey", category: "CAVALRY", clan: "IE2", rating: 85 },
  { name: "Aela", category: "CAVALRY", clan: "KoPL", rating: 85 },
  { name: "Merminal", category: "CAVALRY", clan: "IE2", rating: 85 },
  { name: "albie", category: "CAVALRY", clan: "IE", rating: 85 },

  // Archer
  { name: "Koso", category: "ARCHER", clan: "IE", rating: 85 },
  { name: "Aesten", category: "ARCHER", clan: "VW", rating: 85 },
  { name: "Longinus", category: "ARCHER", clan: "IE", rating: 85 },
  { name: "royal", category: "ARCHER", clan: "IE2", rating: 85 },
  { name: "saviour", category: "ARCHER", clan: "RPGS", rating: 85 },
  { name: "Shav", category: "ARCHER", clan: "Div", rating: 85 },
  { name: "Ahoen", category: "ARCHER", clan: "KoPL", rating: 85 },

  // Infantry
  { name: "SMASH", category: "INFANTRY", clan: "IE", rating: 85 },
  { name: "Nutella", category: "INFANTRY", clan: "Div", rating: 85 },
  { name: "Pablo", category: "INFANTRY", clan: "RPGS", rating: 85 },
  { name: "Burst", category: "INFANTRY", clan: "IE2", rating: 85 },
  { name: "cleqfy", category: "INFANTRY", clan: "Div", rating: 85 },
  { name: "Joker", category: "INFANTRY", clan: "IE2", rating: 85 },
  { name: "Arni", category: "INFANTRY", clan: "IE", rating: 85 },
  { name: "DarkLight", category: "INFANTRY", clan: "IE", rating: 85 },
  { name: "Carlos", category: "INFANTRY", clan: "IE2", rating: 85 },
  { name: "Ari", category: "INFANTRY", clan: "KoPL", rating: 85 },
  { name: "Zom54p", category: "INFANTRY", clan: "IE", rating: 85 },
  { name: "Nomis", category: "INFANTRY", clan: "VW", rating: 85 },
  { name: "Tazatko", category: "INFANTRY", clan: "Div", rating: 85 },
  { name: "Nightwing", category: "INFANTRY", clan: "IE2", rating: 85 },
  { name: "Reincarnation", category: "INFANTRY", clan: "RPGS", rating: 85 },
  { name: "MysteriousHero", category: "INFANTRY", clan: "RPGS", rating: 85 },
  { name: "Shkiper", category: "INFANTRY", clan: "RPGS", rating: 85 },
  { name: "Thoros", category: "INFANTRY", clan: "VW", rating: 85 },
  { name: "dertli kemanci", category: "INFANTRY", clan: "VW", rating: 85 },
  { name: "Big G", category: "INFANTRY", clan: "KoPL", rating: 85 },
  { name: "Silver", category: "INFANTRY", clan: "Div", rating: 85 },
  { name: "Lam", category: "INFANTRY", clan: "VW", rating: 85 },
  { name: "pyncook", category: "INFANTRY", clan: "KoPL", rating: 85 },
  { name: "Fylyp", category: "INFANTRY", clan: "KoPL", rating: 85 },
  { name: "Mert", category: "INFANTRY", clan: "Div", rating: 85 },
  { name: "Enter", category: "INFANTRY", clan: "Div", rating: 85 },
  { name: "Shrek", category: "INFANTRY", clan: "KoPL", rating: 85 },
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
        division: rater.division,
        isProfileComplete: true,
      },
    })
    raters.push(user)
    
    // Make sure these system users are "eligible" by adding dummy ratings if needed
    // But for now we just need them to exist to rate the players
  }
  
  console.log(`Created ${raters.length} system raters`)

  // 2. Create Players and add 5 initial ratings for each to appear in Global Ranking
  for (const p of PLAYERS_A) {
    const player = await prisma.player.upsert({
      where: { name: p.name },
      update: {
        category: p.category,
        clan: p.clan,
      },
      create: {
        name: p.name,
        category: p.category,
        clan: p.clan,
      },
    })
    
    console.log(`Created/Updated player: ${player.name}`)
    
    // Add 5 ratings for each player (required to show in global ranking)
    // We vary the score slightly around the base rating (e.g. 85 ± 1) to look natural
    // but keep average exactly or very close to target
    
    const scores = [p.rating, p.rating, p.rating + 1, p.rating - 1, p.rating]
    
    for (let i = 0; i < 5; i++) {
      const rater = raters[i]
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
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

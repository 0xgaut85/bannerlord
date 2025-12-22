const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.player.create({
  data: {
    name: 'Zeyden',
    category: 'INFANTRY',
    nationality: 'FR',
    isLegend: true
  }
})
.then(r => console.log('✅ Added:', r.name, '- INFANTRY 🇫🇷'))
.catch(e => console.log('❌ Error:', e.message))
.finally(() => p.$disconnect());


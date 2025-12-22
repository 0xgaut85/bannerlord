const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.player.delete({
  where: { name: 'Nikola' }
})
.then(r => console.log('✅ Removed:', r.name))
.catch(e => console.log('❌ Error:', e.message))
.finally(() => p.$disconnect());


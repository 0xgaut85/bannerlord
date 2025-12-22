const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Remove CZ (or Cz after rename)
  try {
    const deleted = await p.player.delete({
      where: { name: 'Cz' }
    });
    console.log('✅ Removed:', deleted.name);
  } catch (e) {
    // Try original name
    try {
      const deleted = await p.player.delete({
        where: { name: 'CZ' }
      });
      console.log('✅ Removed:', deleted.name);
    } catch (e2) {
      console.log('❌ CZ not found');
    }
  }
  
  // Update DragonKing with France nationality
  const dk = await p.player.findFirst({
    where: { name: { equals: 'DragonKing', mode: 'insensitive' } }
  });
  
  if (dk) {
    await p.player.update({
      where: { id: dk.id },
      data: { 
        nationality: 'FR',
        category: 'CAVALRY',
        isLegend: true
      }
    });
    console.log('✅ DragonKing updated: CAVALRY 🇫🇷');
  } else {
    console.log('❌ DragonKing not found');
  }
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());


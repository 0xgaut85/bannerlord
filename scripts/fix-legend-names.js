const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Capitalize first letter, lowercase rest (unless it's a special case)
function properCase(name) {
  // Handle special patterns like CuChulainn, DasGinta, etc - keep internal caps
  // But fix ALL CAPS like DARK → Dark
  
  // If all uppercase, convert to Title Case
  if (name === name.toUpperCase() && name.length > 1) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }
  
  // If starts with lowercase, capitalize first letter
  if (name.charAt(0) === name.charAt(0).toLowerCase()) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  return name;
}

async function main() {
  // First, add DragonKing as legend if not exists
  const existing = await p.player.findFirst({
    where: { name: { equals: 'DragonKing', mode: 'insensitive' } }
  });
  
  if (existing) {
    if (!existing.isLegend) {
      await p.player.update({
        where: { id: existing.id },
        data: { isLegend: true }
      });
      console.log('✅ DragonKing promoted to legend');
    } else {
      console.log('⏭️ DragonKing already a legend');
    }
  } else {
    await p.player.create({
      data: { name: 'DragonKing', category: 'CAVALRY', isLegend: true }
    });
    console.log('✅ DragonKing added as legend');
  }
  
  // Now fix all legend names
  const legends = await p.player.findMany({
    where: { isLegend: true }
  });
  
  console.log('\n=== Fixing legend names ===\n');
  
  let fixed = 0;
  for (const leg of legends) {
    const newName = properCase(leg.name);
    if (newName !== leg.name) {
      await p.player.update({
        where: { id: leg.id },
        data: { name: newName }
      });
      console.log(`🔄 ${leg.name} → ${newName}`);
      fixed++;
    }
  }
  
  console.log(`\nFixed ${fixed} names`);
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());


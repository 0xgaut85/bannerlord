const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.player.findMany({ select: { name: true, isLegend: true, category: true } })
  .then(players => { 
    console.log(JSON.stringify(players)); 
    p.$disconnect(); 
  });


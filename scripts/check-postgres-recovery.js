const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Checking PostgreSQL recovery options...\n")
    
    // Check database size
    const dbSize = await prisma.$queryRaw`
      SELECT pg_size_pretty(pg_database_size('railway')) as db_size
    `
    console.log("Database size:", dbSize[0].db_size)
    
    // Check table sizes
    const tables = await prisma.$queryRaw`
      SELECT 
        schemaname, 
        tablename, 
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `
    console.log("\nTable sizes:")
    tables.forEach(t => {
      console.log(`  ${t.tablename}: ${t.size} (${t.size_bytes} bytes)`)
    })
    
    // Check if WAL directory is accessible
    try {
      const walCheck = await prisma.$queryRaw`
        SELECT setting, unit 
        FROM pg_settings 
        WHERE name = 'wal_level'
      `
      console.log("\nWAL Level:", walCheck[0]?.setting)
      
      // Check PostgreSQL version
      const version = await prisma.$queryRaw`SELECT version()`
      console.log("PostgreSQL version:", version[0].version.split(' ')[0] + ' ' + version[0].version.split(' ')[1])
      
    } catch (e) {
      console.log("Could not check WAL settings:", e.message)
    }
    
    // Check for any existing backups or dumps
    try {
      const backupTables = await prisma.$queryRaw`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename LIKE '%backup%' OR tablename LIKE '%dump%'
      `
      if (backupTables.length > 0) {
        console.log("\nFound backup-related tables:", backupTables)
      }
    } catch (e) {
      // Ignore
    }
    
    // Check transaction log
    try {
      const txInfo = await prisma.$queryRaw`
        SELECT 
          pg_current_wal_lsn() as current_wal,
          pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0') as wal_bytes
      `
      console.log("\nCurrent WAL LSN:", txInfo[0]?.current_wal)
      console.log("WAL bytes written:", txInfo[0]?.wal_bytes)
    } catch (e) {
      console.log("Could not check WAL info:", e.message)
    }
    
  } catch (error) {
    console.error("Error:", error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()


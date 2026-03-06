import pg from 'pg'
const { Client } = pg

const PERIOD_TO_DELETE = "December 2025"

const url = process.argv[2] || process.env.DATABASE_URL
if (!url) {
  console.error("No DATABASE_URL provided. Pass it as an argument: node scripts/delete-period.mjs <DATABASE_URL>")
  process.exit(1)
}

const isRailway = url.includes('rlwy.net') || url.includes('railway')
const cleanUrl = isRailway
  ? url.replace(/[?&]sslmode=[^&]+/g, '').replace(/\?&/, '?').replace(/\?$/, '')
  : url

const client = new Client({
  connectionString: cleanUrl,
  ssl: isRailway ? { rejectUnauthorized: false } : undefined
})

await client.connect()

// List all periods
const periods = await client.query(`SELECT id, name FROM "RankingPeriod" ORDER BY "startDate" ASC`)
console.log("\nAll ranking periods:")
for (const row of periods.rows) {
  const counts = await client.query(
    `SELECT 
      (SELECT count(*) FROM "HistoricalRanking" WHERE "periodId" = $1) as rankings,
      (SELECT count(*) FROM "HistoricalRating" WHERE "periodId" = $1) as ratings`,
    [row.id]
  )
  console.log(`  [${row.id}] "${row.name}" — ${counts.rows[0].rankings} rankings, ${counts.rows[0].ratings} historical ratings`)
}

const target = periods.rows.find(p => p.name === PERIOD_TO_DELETE)
if (!target) {
  console.log(`\nPeriod "${PERIOD_TO_DELETE}" not found. Nothing deleted.`)
  await client.end()
  process.exit(0)
}

console.log(`\nDeleting "${target.name}" (id: ${target.id}) and all its data...`)

// Delete in order (foreign key constraints)
const r1 = await client.query(`DELETE FROM "HistoricalRating" WHERE "periodId" = $1`, [target.id])
const r2 = await client.query(`DELETE FROM "HistoricalRanking" WHERE "periodId" = $1`, [target.id])
const r3 = await client.query(`DELETE FROM "RankingPeriod" WHERE id = $1`, [target.id])

console.log(`  Deleted ${r1.rowCount} historical ratings`)
console.log(`  Deleted ${r2.rowCount} historical rankings`)
console.log(`  Deleted ${r3.rowCount} period record`)
console.log(`\nDone. "${PERIOD_TO_DELETE}" has been fully removed.`)

const remaining = await client.query(`SELECT name FROM "RankingPeriod" ORDER BY "startDate" ASC`)
console.log("Remaining periods:", remaining.rows.map(p => p.name))

await client.end()

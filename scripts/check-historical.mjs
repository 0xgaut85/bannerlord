import pg from 'pg';
const { Client } = pg;

const url = process.env.DATABASE_URL || process.argv[2];
if (!url) { console.error('Set DATABASE_URL'); process.exit(1); }

const c = new Client({
  connectionString: url.replace(/[?&]sslmode=[^&]+/g, ''),
  ssl: { rejectUnauthorized: false }
});

await c.connect();

const hr = await c.query('SELECT COUNT(*) as count FROM "HistoricalRating"');
console.log('HistoricalRating rows:', hr.rows[0].count);

const rp = await c.query('SELECT id, name, "createdAt" FROM "RankingPeriod" ORDER BY "createdAt" DESC');
console.log('RankingPeriods:');
rp.rows.forEach(r => console.log(`  - ${r.name} (${r.id}) created ${r.createdAt}`));

const rt = await c.query('SELECT COUNT(*) as count FROM "Rating"');
console.log('Current Rating rows:', rt.rows[0].count);

await c.end();

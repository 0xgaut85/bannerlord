import pg from 'pg';
const { Client } = pg;

const url = "postgresql://postgres:aKaLufssotIeDrKIUGjxkkpPcmYMgyVm@crossover.proxy.rlwy.net:18916/railway";

const c = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

try {
  await c.connect();
  console.log('Connected to old DB successfully.');

  const rt = await c.query('SELECT COUNT(*) as count FROM "Rating"');
  console.log('Old DB Rating rows:', rt.rows[0].count);

  const sample = await c.query('SELECT r.id, r."playerId", r."raterId", r.score FROM "Rating" r LIMIT 3');
  console.log('Sample ratings:', JSON.stringify(sample.rows, null, 2));

  await c.end();
} catch (e) {
  console.error('Old DB error:', e.message);
  await c.end().catch(() => {});
}

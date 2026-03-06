import pg from 'pg';
const { Client } = pg;

const url = process.argv[2] || process.env.DATABASE_URL;
const isRailway = url.includes('rlwy.net') || url.includes('railway');
const cleanUrl = isRailway
  ? url.replace(/[?&]sslmode=[^&]+/g, '').replace(/\?&/, '?').replace(/\?$/, '')
  : url;

const client = new Client({
  connectionString: cleanUrl,
  ssl: isRailway ? { rejectUnauthorized: false } : undefined
});

await client.connect();
const tables = await client.query(
  "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
);
const names = tables.rows.map(r => `"${r.tablename}"`).join(', ');
await client.query(`TRUNCATE ${names} CASCADE`);
console.log('Truncated all tables:', tables.rows.map(r => r.tablename).join(', '));
await client.end();

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

const r = await client.query(`
  SELECT 
    count(*) as total,
    count(avatar) as with_avatar,
    count(*) - count(avatar) as without_avatar
  FROM "Player"
`);
console.log('Player avatars:', r.rows[0]);

const sample = await client.query(`
  SELECT name, left(avatar, 60) as avatar_preview 
  FROM "Player" 
  WHERE avatar IS NOT NULL 
  LIMIT 5
`);
console.log('Sample avatars:');
sample.rows.forEach(r => console.log(`  ${r.name}: ${r.avatar_preview}...`));

await client.end();

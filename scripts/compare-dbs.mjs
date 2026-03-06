import pg from 'pg';
const { Client } = pg;

async function connect(url) {
  const clean = url.replace(/[?&]sslmode=[^&]+/g, '').replace(/\?&/, '?').replace(/\?$/, '');
  const client = new Client({
    connectionString: clean,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  return client;
}

const oldUrl = process.argv[2];
const newUrl = process.argv[3];

const oldDb = await connect(oldUrl);
const newDb = await connect(newUrl);

// Compare Player avatars
const oldAvatars = await oldDb.query('SELECT count(*) as total, count(avatar) as with_avatar FROM "Player"');
const newAvatars = await newDb.query('SELECT count(*) as total, count(avatar) as with_avatar FROM "Player"');
console.log('=== Player Avatars ===');
console.log('OLD DB:', oldAvatars.rows[0]);
console.log('NEW DB:', newAvatars.rows[0]);

// Compare Clan logos
const oldClans = await oldDb.query('SELECT count(*) as total, count(logo) as with_logo FROM "Clan"');
const newClans = await newDb.query('SELECT count(*) as total, count(logo) as with_logo FROM "Clan"');
console.log('\n=== Clan Logos ===');
console.log('OLD DB:', oldClans.rows[0]);
console.log('NEW DB:', newClans.rows[0]);

// Find players with avatar in old but not new
const missing = await oldDb.query(`
  SELECT id, name, left(avatar, 40) as avatar_start 
  FROM "Player" 
  WHERE avatar IS NOT NULL 
  ORDER BY name
`);
const newPlayers = await newDb.query(`
  SELECT id, name, avatar IS NOT NULL as has_avatar 
  FROM "Player" 
  ORDER BY name
`);
const newMap = new Map(newPlayers.rows.map(r => [r.id, r]));

console.log('\n=== Players with avatar in OLD but missing in NEW ===');
let missingCount = 0;
for (const p of missing.rows) {
  const n = newMap.get(p.id);
  if (!n || !n.has_avatar) {
    console.log(`  MISSING: ${p.name} (${p.id}) - old avatar: ${p.avatar_start}...`);
    missingCount++;
  }
}
console.log(`Total missing: ${missingCount} out of ${missing.rows.length} avatars`);

// Compare row counts
console.log('\n=== Row Counts ===');
const tables = ['Account', 'Clan', 'Player', 'Rating', 'User', 'Session', 'EditRequest', 'HistoricalRanking'];
for (const t of tables) {
  const oldC = await oldDb.query(`SELECT count(*) as n FROM "${t}"`);
  const newC = await newDb.query(`SELECT count(*) as n FROM "${t}"`);
  const diff = Number(oldC.rows[0].n) - Number(newC.rows[0].n);
  console.log(`${t}: old=${oldC.rows[0].n} new=${newC.rows[0].n}${diff ? ` (DIFF: ${diff})` : ''}`);
}

await oldDb.end();
await newDb.end();

#!/usr/bin/env node
/**
 * One-time script to extract individual Rating records from the old Railway DB
 * and insert them as HistoricalRating records in the new Railway DB.
 *
 * Usage:
 *   node scripts/restore-historical-ratings.mjs <OLD_DB_URL> <NEW_DB_URL>
 *
 * Example:
 *   node scripts/restore-historical-ratings.mjs \
 *     "postgresql://postgres:aKaLu...@crossover.proxy.rlwy.net:18916/railway" \
 *     "postgresql://postgres:zQkso...@shinkansen.proxy.rlwy.net:34017/railway"
 */
import pg from 'pg';
const { Client } = pg;

function prepareUrl(url) {
  if (url.includes('rlwy.net') || url.includes('railway')) {
    return url.replace(/[?&]sslmode=[^&]+/g, '').replace(/\?&/, '?').replace(/\?$/, '');
  }
  return url;
}

function clientConfig(url) {
  const isRailway = url.includes('rlwy.net') || url.includes('railway');
  return {
    connectionString: prepareUrl(url),
    ssl: isRailway ? { rejectUnauthorized: false } : undefined,
  };
}

function generateCuid() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  const counter = Math.floor(Math.random() * 1000).toString(36);
  return `c${timestamp}${counter}${random}`;
}

async function main() {
  const oldUrl = process.argv[2];
  const newUrl = process.argv[3];

  if (!oldUrl || !newUrl) {
    console.error('Usage: node scripts/restore-historical-ratings.mjs <OLD_DB_URL> <NEW_DB_URL>');
    process.exit(1);
  }

  const oldClient = new Client(clientConfig(oldUrl));
  const newClient = new Client(clientConfig(newUrl));

  try {
    console.log('Connecting to old Railway DB...');
    await oldClient.connect();
    console.log('Connected to old DB.');

    console.log('Connecting to new Railway DB...');
    await newClient.connect();
    console.log('Connected to new DB.');

    // Get legend player IDs from old DB
    const legendRes = await oldClient.query(
      `SELECT id FROM "Player" WHERE "isLegend" = true`
    );
    const legendIds = new Set(legendRes.rows.map(r => r.id));
    console.log(`Found ${legendIds.size} legend players to skip.`);

    // Fetch all ratings with rater info from old DB
    const ratingsRes = await oldClient.query(`
      SELECT
        r.id,
        r."playerId",
        r."raterId",
        r.score,
        u.name AS "raterName",
        u."discordName" AS "raterDiscordName",
        u.division AS "raterDivision"
      FROM "Rating" r
      JOIN "User" u ON u.id = r."raterId"
      WHERE r."playerId" NOT IN (SELECT id FROM "Player" WHERE "isLegend" = true)
    `);

    const ratings = ratingsRes.rows;
    console.log(`Found ${ratings.length} non-legend ratings to preserve.`);

    if (ratings.length === 0) {
      console.log('No ratings to restore. Done.');
      return;
    }

    // Find the historical RankingPeriod in the new DB
    const periodRes = await newClient.query(
      `SELECT id, name FROM "RankingPeriod" ORDER BY "createdAt" DESC LIMIT 5`
    );

    if (periodRes.rows.length === 0) {
      console.error('No RankingPeriod found in the new database. Create one first via the admin panel.');
      process.exit(1);
    }

    console.log('\nAvailable periods in new DB:');
    periodRes.rows.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} (${p.id})`));

    const targetPeriod = periodRes.rows[0];
    console.log(`\nUsing most recent period: "${targetPeriod.name}" (${targetPeriod.id})`);

    // Check for existing historical ratings for this period
    const existingRes = await newClient.query(
      `SELECT COUNT(*) as count FROM "HistoricalRating" WHERE "periodId" = $1`,
      [targetPeriod.id]
    );
    const existingCount = parseInt(existingRes.rows[0].count);
    if (existingCount > 0) {
      console.log(`Warning: ${existingCount} historical ratings already exist for this period.`);
      console.log('Skipping to avoid duplicates. Delete existing records first if you want to re-run.');
      return;
    }

    // Insert in batches of 500
    const BATCH_SIZE = 500;
    let inserted = 0;

    for (let i = 0; i < ratings.length; i += BATCH_SIZE) {
      const batch = ratings.slice(i, i + BATCH_SIZE);
      const values = [];
      const params = [];
      let paramIdx = 1;

      for (const r of batch) {
        values.push(
          `($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`
        );
        params.push(
          generateCuid(),
          targetPeriod.id,
          r.playerId,
          r.raterId,
          r.score,
          r.raterName || null,
          r.raterDiscordName || null,
          r.raterDivision || null,
        );
      }

      await newClient.query(
        `INSERT INTO "HistoricalRating" (id, "periodId", "playerId", "raterId", score, "raterName", "raterDiscordName", "raterDivision")
         VALUES ${values.join(', ')}`,
        params
      );

      inserted += batch.length;
      console.log(`Inserted ${inserted} / ${ratings.length} historical ratings...`);
    }

    console.log(`\nDone! Inserted ${inserted} historical ratings into period "${targetPeriod.name}".`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await oldClient.end().catch(() => {});
    await newClient.end().catch(() => {});
  }
}

main();

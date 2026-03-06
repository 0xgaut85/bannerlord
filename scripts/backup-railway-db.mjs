#!/usr/bin/env node
/**
 * Full dump of Railway PostgreSQL to bannerlord_backup.sql
 *
 * Run locally: DATABASE_URL='postgresql://...' node scripts/backup-railway-db.mjs
 * Or: node scripts/backup-railway-db.mjs "postgresql://..."
 *
 * If you get ECONNRESET from your machine, Railway may only allow DB connections
 * from inside their network. Run this from Railway instead:
 * - Railway dashboard → your app service → "Run a command" / Shell
 * - Set DATABASE_URL to your Postgres URL, then: node scripts/backup-railway-db.mjs
 * - Download the generated bannerlord_backup.sql from the run artifacts or copy out.
 */
import pg from 'pg';
import { writeFileSync } from 'fs';
import { join } from 'path';

const { Client } = pg;

function escapeLiteral(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number' && !Number.isNaN(val)) return String(val);
  if (val instanceof Date) return `'${val.toISOString().replace(/'/g, "''")}'::timestamptz`;
  if (Buffer.isBuffer(val)) return `'\\\\x${val.toString('hex')}'::bytea`;
  if (Array.isArray(val)) {
    const elems = val.map(v => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
    return `'{${elems.join(',')}}'`;
  }
  const s = String(val);
  return `'${s.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

async function main() {
  let url = process.argv[2] || process.env.DATABASE_URL;
  if (!url) {
    console.error('Set DATABASE_URL or pass connection URL as first argument.');
    process.exit(1);
  }
  const isRailway = url.includes('rlwy.net') || url.includes('railway');
  if (isRailway) {
    // Strip sslmode from URL so our ssl config (rejectUnauthorized: false) is used
    url = url.replace(/[?&]sslmode=[^&]+/g, '').replace(/\?&/, '?').replace(/\?$/, '');
  } else if (!url.includes('sslmode=')) {
    url += url.includes('?') ? '&sslmode=require' : '?sslmode=require';
  }
  const client = new Client({
    connectionString: url,
    ssl: isRailway ? { rejectUnauthorized: false } : undefined
  });
  await client.connect();

  const outPath = join(process.cwd(), 'bannerlord_backup.sql');
  const lines = [
    '-- Bannerlord Railway DB backup',
    `-- Generated at ${new Date().toISOString()}`,
    '-- Restore: ensure schema exists (e.g. prisma db push), then: psql $DATABASE_URL -f bannerlord_backup.sql',
    '',
    'SET session_replication_role = replica;',
    ''
  ];

  const tablesRes = await client.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  const tables = tablesRes.rows.map((r) => r.tablename);

  for (const table of tables) {
    const colsRes = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [table]);
    const columns = colsRes.rows.map((r) => r.column_name);
    const colList = columns.map((c) => `"${c}"`).join(', ');

    const res = await client.query(`SELECT * FROM "${table}"`);
    if (res.rows.length === 0) {
      lines.push(`-- Table "${table}" (0 rows)`);
      lines.push('');
      continue;
    }

    const batchSize = 100;
    for (let i = 0; i < res.rows.length; i += batchSize) {
      const batch = res.rows.slice(i, i + batchSize);
      const values = batch.map((row) => {
        const vals = columns.map((col) => escapeLiteral(row[col]));
        return `(${vals.join(', ')})`;
      });
      lines.push(`INSERT INTO "${table}" (${colList}) VALUES`);
      lines.push(values.join(',\n'));
      lines.push(';');
      lines.push('');
    }
  }

  lines.push('SET session_replication_role = DEFAULT;');
  lines.push('');

  writeFileSync(outPath, lines.join('\n'), 'utf8');
  await client.end();

  console.log('Backup written to:', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

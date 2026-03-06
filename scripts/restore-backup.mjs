#!/usr/bin/env node
/**
 * Restore bannerlord_backup.sql into the database at DATABASE_URL.
 *
 * Run: DATABASE_URL='postgresql://...' node scripts/restore-backup.mjs
 * Or:  node scripts/restore-backup.mjs "postgresql://..."
 * Optional second arg: path to backup file (default: bannerlord_backup.sql in cwd).
 */
import pg from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const { Client } = pg;

/** Split SQL file into statements, respecting string literals so we don't split on ; inside '...' */
function splitSqlStatements(content) {
  const cleaned = content
    .split('\n')
    .filter(line => !line.trimStart().startsWith('--'))
    .join('\n');

  const statements = [];
  let current = '';
  let inSingle = false;
  let i = 0;
  while (i < cleaned.length) {
    const c = cleaned[i];
    if (!inSingle) {
      if (c === "'") {
        inSingle = true;
        current += c;
        i++;
        continue;
      }
      if (c === ';') {
        current += c;
        const stmt = current.trim();
        if (stmt) statements.push(stmt);
        current = '';
        i++;
        continue;
      }
      current += c;
      i++;
      continue;
    }
    if (c === "'" && cleaned[i + 1] === "'") {
      current += "''";
      i += 2;
      continue;
    }
    if (c === "'") {
      inSingle = false;
      current += c;
      i++;
      continue;
    }
    current += c;
    i++;
  }
  const last = current.trim();
  if (last) statements.push(last);
  return statements;
}

async function main() {
  let url = process.argv[2] || process.env.DATABASE_URL;
  if (!url) {
    console.error('Set DATABASE_URL or pass connection URL as first argument.');
    process.exit(1);
  }
  const backupPath = process.argv[3]
    ? join(process.cwd(), process.argv[3])
    : join(process.cwd(), 'bannerlord_backup.sql');

  const isRailway = url.includes('rlwy.net') || url.includes('railway');
  if (isRailway) {
    url = url.replace(/[?&]sslmode=[^&]+/g, '').replace(/\?&/, '?').replace(/\?$/, '');
  } else if (!url.includes('sslmode=')) {
    url += url.includes('?') ? '&sslmode=require' : '?sslmode=require';
  }

  const client = new Client({
    connectionString: url,
    ssl: isRailway ? { rejectUnauthorized: false } : undefined
  });

  let sql;
  try {
    sql = readFileSync(backupPath, 'utf8');
  } catch (err) {
    console.error('Failed to read backup file:', backupPath, err.message);
    process.exit(1);
  }

  await client.connect();

  // Truncate all existing data so restore is idempotent
  const tablesRes = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
  );
  if (tablesRes.rows.length > 0) {
    const names = tablesRes.rows.map(r => `"${r.tablename}"`).join(', ');
    await client.query(`TRUNCATE ${names} CASCADE`);
    console.log('Truncated', tablesRes.rows.length, 'tables.');
  }

  const statements = splitSqlStatements(sql);
  let executed = 0;
  let skipped = 0;
  for (const stmt of statements) {
    if (!stmt || stmt.startsWith('--')) continue;
    try {
      await client.query(stmt);
      executed++;
    } catch (err) {
      if (err.code === '23505') {
        skipped++;
        continue;
      }
      console.error('Statement failed:', stmt.slice(0, 120) + '...', err.message);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log(`Restore complete. Executed ${executed} statements.${skipped ? ` Skipped ${skipped} duplicates.` : ''}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

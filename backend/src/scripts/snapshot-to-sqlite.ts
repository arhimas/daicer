import knex, { Knex } from 'knex';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import ora from 'ora';
import chalk from 'chalk';

dotenv.config();

const BATCH_SIZE = 500;
const OUTPUT_DIR = path.join(process.cwd(), 'backups');

const mapPostgresTypeToSqlite = (table: Knex.CreateTableBuilder, col: any) => {
  const name = col.column_name;
  const type = col.data_type;

  // Basic mapping
  switch (true) {
    case type === 'integer':
    case type === 'bigint':
    case type === 'smallint':
      // Handle ID columns specifically to ensure they are primary keys if needed,
      // but for a backup, simple integers are often safer unless we know the PK constraints.
      // Strapi usually names PK 'id'.
      if (name === 'id') {
        table.increments('id').primary();
      } else {
        table.integer(name);
      }
      break;

    case type === 'boolean':
      table.boolean(name); // Knex handles this as integer 1/0 for sqlite
      break;

    case type.includes('character'):
    case type.includes('text'):
    case type === 'uuid':
      table.text(name);
      break;

    case type === 'json':
    case type === 'jsonb':
      table.json(name); // Knex handles stringifying
      break;

    case type.includes('timestamp'):
    case type.includes('date'):
      table.dateTime(name);
      break;

    case type === 'numeric':
    case type === 'real':
    case type === 'double precision':
      table.float(name);
      break;

    default:
      table.text(name); // Fallback
  }
};

async function snapshot() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup_${timestamp}.sqlite`;

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  const targetPath = path.join(OUTPUT_DIR, filename);
  console.log(chalk.cyan(`📦 Starting snapshot to ${targetPath}...`));

  // 1. Connect to Postgres (Source)
  const source = knex({
    client: 'postgres',
    connection: {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
  });

  // 2. Connect to SQLite (Target)
  const target = knex({
    client: 'better-sqlite3',
    connection: {
      filename: targetPath,
    },
    useNullAsDefault: true,
  });

  const spinner = ora('Connecting to databases...').start();

  try {
    // Check source connection
    await source.raw('SELECT 1');
    spinner.succeed('Connected to PostgreSQL source.');

    // Get Tables
    spinner.start('Introspecting schema...');

    // Query for all public tables
    const tables = await source('information_schema.tables')
      .where('table_schema', 'public')
      .where('table_type', 'BASE TABLE')
      .pluck('table_name');

    spinner.succeed(`Found ${tables.length} tables to backup.`);

    for (const tableName of tables) {
      if (tableName.startsWith('pg_')) continue; // skip internal

      spinner.start(`Backing up table: ${chalk.yellow(tableName)}`);

      // Get Columns
      const columns = await source('information_schema.columns')
        .where('table_schema', 'public')
        .where('table_name', tableName)
        .orderBy('ordinal_position', 'asc');

      // Create Table in SQLite
      await target.schema.createTable(tableName, (table) => {
        for (const col of columns) {
          mapPostgresTypeToSqlite(table, col);
        }
      });

      // Transfer Data
      let processed = 0;
      let offset = 0;

      while (true) {
        const rows = await source(tableName).select('*').limit(BATCH_SIZE).offset(offset);

        if (rows.length === 0) break;

        // Transform data for SQLite compat
        const cleanedRows = rows.map((row) => {
          const newRow: any = { ...row };
          for (const key in newRow) {
            const val = newRow[key];
            if (val === null) continue;

            // Handle Objects/Arrays -> String for SQLite if it was JSONB
            // Note: Knex .json() column type handles stringification automatically on insert?
            // Actually better-sqlite3 expects strings for JSON columns usually.
            // But Knex might handle it. Let's be manual to be safe if Knex introspected type vs dynamic.
            if (typeof val === 'object' && !(val instanceof Date)) {
              newRow[key] = JSON.stringify(val);
            }
            // Handle Dates -> ISO String
            if (val instanceof Date) {
              newRow[key] = val.toISOString();
            }
          }
          return newRow;
        });

        await target(tableName).insert(cleanedRows);

        processed += rows.length;
        offset += BATCH_SIZE;
      }

      spinner.succeed(`Backed up ${tableName}: ${processed} rows.`);
    }

    console.log(chalk.green(`\n✅ Backup completed successfully!`));
    console.log(`File: ${targetPath}`);

    // Update Test Bootstrap
    const bootstrapPath = path.join(process.cwd(), '.tmp', 'test_bootstrap.db');
    // Ensure .tmp exists
    const tmpDir = path.dirname(bootstrapPath);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    fs.copyFileSync(targetPath, bootstrapPath);
    console.log(chalk.blue(`🔄 Updated test bootstrap: ${bootstrapPath}`));
  } catch (error) {
    spinner.fail('Backup failed.');
    console.error(error);
  } finally {
    await source.destroy();
    await target.destroy();
  }
}

snapshot();

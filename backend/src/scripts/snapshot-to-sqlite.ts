/* eslint-disable @typescript-eslint/no-explicit-any */
import knex, { Knex } from 'knex';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import ora from 'ora';
import chalk from 'chalk';
import Database from 'better-sqlite3';

dotenv.config();

const BATCH_SIZE = 500;
const OUTPUT_DIR = path.join(process.cwd(), 'backups');

const EXTENSION_PATH = path.join(process.cwd(), 'extensions', 'vector.dylib');

const mapPostgresTypeToSqlite = (table: Knex.CreateTableBuilder, col: any) => {
  const name = col.column_name;
  const type = col.data_type;

  // Use BLOB for embedding columns to support sqlite-vector efficiently
  if (name === 'embedding' || name === 'vector') {
    table.specificType(name, 'BLOB');
    return;
  }

  // Basic mapping
  switch (true) {
    case type === 'integer':
    case type === 'bigint':
    case type === 'smallint':
      if (name === 'id') {
        table.increments('id').primary();
      } else {
        table.integer(name);
      }
      break;

    case type === 'boolean':
      table.boolean(name);
      break;

    case type.includes('character'):
    case type.includes('text'):
    case type === 'uuid':
      table.text(name);
      break;

    case type === 'json':
    case type === 'jsonb':
      table.json(name);
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
      // Check if it's a vector type disguised as user-defined
      if (type === 'USER-DEFINED' && (name === 'embedding' || name === 'vector')) {
        table.specificType(name, 'BLOB');
      } else {
        table.text(name);
      }
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

  // 2. Connect to SQLite (Target) via Knex for Schema/Data
  const target = knex({
    client: 'better-sqlite3',
    connection: {
      filename: targetPath,
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn: any, done: (...args: unknown[]) => void) => {
        // Load extension if available
        if (fs.existsSync(EXTENSION_PATH)) {
          try {
            conn.loadExtension(EXTENSION_PATH);
            console.log(chalk.green('✅ Loaded sqlite-vector extension'));
          } catch (e) {
            console.warn(chalk.yellow('⚠️ Failed to load sqlite-vector extension:'), e);
          }
        } else {
          // Try loading from standard paths or assume pre-loaded if test setup
          // console.warn(chalk.yellow(`⚠️ Extension not found at ${EXTENSION_PATH}`));
        }
        done(null, conn);
      },
    },
  });

  const spinner = ora('Connecting to databases...').start();

  try {
    await source.raw('SELECT 1');
    spinner.succeed('Connected to PostgreSQL source.');

    // Introspect
    spinner.start('Introspecting schema...');
    const tables = await source('information_schema.tables')
      .where('table_schema', 'public')
      .where('table_type', 'BASE TABLE')
      .pluck('table_name');

    spinner.succeed(`Found ${tables.length} tables to backup.`);

    for (const tableName of tables) {
      if (tableName.startsWith('pg_')) continue;

      spinner.start(`Backing up table: ${chalk.yellow(tableName)}`);

      const columns = await source('information_schema.columns')
        .where('table_schema', 'public')
        .where('table_name', tableName)
        .orderBy('ordinal_position', 'asc');

      // Create Table
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

        const cleanedRows = rows.map((row) => {
          const newRow: any = { ...row };
          for (const key in newRow) {
            const val = newRow[key];
            if (val === null) continue;

            if (typeof val === 'object' && !(val instanceof Date) && !Buffer.isBuffer(val)) {
              // If it's the embedding column, check if it's already string/array
              // If PG returns 'vector' type as string '[-0.1, ...]', we might want to keep it as string for now
              // and let the vector_convert handle it later?
              // Or if we defined column as BLOB, we should insert Buffer if possible.
              // But better-sqlite3 handles Buffers.
              // If we have a JSON array, we can stringify it.
              if (key === 'embedding' || key === 'vector') {
                // If it's an array, stringify it - sqlite-vector can convert string to f32 blob manually
                // Or we can try to convert to Buffer here?
                // Float32Array
                if (Array.isArray(val)) {
                  newRow[key] = JSON.stringify(val); // Insert as JSON string first
                } else {
                  newRow[key] = JSON.stringify(val);
                }
              } else {
                newRow[key] = JSON.stringify(val);
              }
            }
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

    // 3. Post-Process: Vector Initialization
    if (fs.existsSync(EXTENSION_PATH)) {
      const db = new Database(targetPath);
      db.loadExtension(EXTENSION_PATH);

      console.log(chalk.blue('Running Vector Initialization...'));

      // Find tables with 'embedding' column
      for (const tableName of tables) {
        // Check if table has embedding column

        const cols = db.pragma(`table_info(${tableName})`) as any[];
        const hasEmbedding = cols.some((c) => c.name === 'embedding');

        if (hasEmbedding) {
          console.log(`Initializing vector for ${tableName}...`);
          try {
            // 1. Convert data to Float32 BLOBs
            // We inserted them as JSON strings likely.
            // vector_convert_f32(json_str) -> blob
            db.prepare(
              `UPDATE ${tableName} SET embedding = vector_convert_f32(embedding) WHERE typeof(embedding) = 'text'`
            ).run();

            // 2. Initialize
            // Assuming 1536 dim for OpenAI
            db.prepare(
              `SELECT vector_init('${tableName}', 'embedding', 'type=FLOAT32,dimension=1536,distance=COSINE')`
            ).get();

            console.log(chalk.green(`✅ Vector initialized for ${tableName}`));
          } catch (err: any) {
            console.error(chalk.red(`Failed to init vector for ${tableName}:`), err.message);
          }
        }
      }
      db.close();
    }

    console.log(chalk.green(`\n✅ Backup completed successfully!`));
    console.log(`File: ${targetPath}`);

    // Update Test Bootstrap
    const bootstrapPath = path.join(process.cwd(), '.tmp', 'test_bootstrap.db');
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

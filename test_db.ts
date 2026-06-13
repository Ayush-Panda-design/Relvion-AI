// Ensure env variables are loaded first
require('dotenv').config();

const { Pool } = require('pg');

async function test() {
  const dbUrl = process.env.DATABASE_URL;
  console.log('Using DATABASE_URL:', dbUrl);

  const pool = new Pool({ connectionString: dbUrl });

  try {
    const res = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log('Tables in public schema:', res.rows.map((r: any) => r.tablename));

    // Let's check if there are any tables, e.g. emails, corsair connections, etc.
    if (res.rows.length === 0) {
      console.log('No tables found! Database is empty.');
    } else {
      // Print row count for each table
      for (const table of res.rows.map((r: any) => r.tablename)) {
        try {
          const countRes = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
          console.log(`Table "${table}" row count:`, countRes.rows[0].count);
        } catch (tableErr: any) {
          console.log(`Error querying table "${table}":`, tableErr.message);
        }
      }
    }
  } catch (err: any) {
    console.error('Database Connection Error:', err.message || err);
  } finally {
    await pool.end();
  }
}

test();

import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';

const db = new PGlite('./pglite-data');

async function initDb() {
  try {
    const sql = fs.readFileSync('./db.sql', 'utf-8');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 80) + '...');
      await db.exec(statement);
    }
    
    console.log('Database initialization completed successfully');
    await db.close();
  } catch (e) {
    console.error('Database initialization failed:', e);
    process.exit(1);
  }
}

initDb();

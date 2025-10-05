import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pgliteInstance: PGlite | null = null;

export async function getPGlite(): Promise<PGlite> {
  if (pgliteInstance) {
    return pgliteInstance;
  }

  const dataDir = process.env.NODE_ENV === 'test' 
    ? './pglite-test-data'
    : './pglite-data';
  
  pgliteInstance = new PGlite(dataDir);
  
  const dbSql = fs.readFileSync(path.join(__dirname, 'db.sql'), 'utf-8');
  const commands = dbSql.split(';').filter(cmd => cmd.trim());
  
  for (const cmd of commands) {
    if (cmd.trim()) {
      try {
        await pgliteInstance.query(cmd);
      } catch (error: any) {
        if (!error.message.includes('already exists')) {
          console.error('Error executing SQL command:', error);
        }
      }
    }
  }
  
  return pgliteInstance;
}

export class PGlitePool {
  private db: PGlite | null = null;

  async query(text: string, params?: any[]) {
    if (!this.db) {
      this.db = await getPGlite();
    }
    return this.db.query(text, params);
  }

  async connect() {
    if (!this.db) {
      this.db = await getPGlite();
    }
    return {
      query: async (text: string, params?: any[]) => {
        return this.db!.query(text, params);
      },
      release: () => {},
    };
  }
}

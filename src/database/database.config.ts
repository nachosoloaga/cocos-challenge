import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB } from './database-types';

let pool: Pool | null = null;

export const createDatabase = (): Kysely<DB> => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      ssl: process.env.ENV === 'local' ? false : true,
    });
  }

  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool,
    }),
  });
};

export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

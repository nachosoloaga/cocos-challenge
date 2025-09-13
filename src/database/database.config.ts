import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { DB } from './database-types';

export const createDatabase = (configService: ConfigService): Kysely<DB> => {
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        ssl: true,
      }),
    }),
  });
};

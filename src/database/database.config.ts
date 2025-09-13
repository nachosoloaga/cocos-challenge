import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

export interface Database {
  users: {  
    id: number;
    email: string;
    accountNumber: string;
  };
  instruments: {
    id: number;
    ticker: string;
    name: string;
    type: string;
  };
  orders: {
    id: number;
    instrumentId: number;
    userId: number;
    side: string;
    size: number;
    price: number | null;
    type: string;
    status: string;
    datetime: Date;
  };
  marketdata: {
    id: number;
    instrumentId: number;
    high: number;
    low: number;
    open: number;
    close: number;
    previousClose: number;
    datetime: Date;
  };
}

export const createDatabase = (configService: ConfigService): Kysely<Database> => {
  return new Kysely<Database>({
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

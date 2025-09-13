import { Provider } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database, createDatabase } from './database.config';
import { ConfigService } from '@nestjs/config';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export const databaseProvider: Provider = {
  provide: DATABASE_CONNECTION,
  useFactory: (configService: ConfigService): Kysely<Database> => {
    return createDatabase(configService);
  },
};

import { Provider } from '@nestjs/common';
import { Kysely } from 'kysely';
import { createDatabase } from './database.config';
import { DB } from './database-types';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export const databaseProvider: Provider = {
  provide: DATABASE_CONNECTION,
  useFactory: (): Kysely<DB> => {
    return createDatabase();
  },
};

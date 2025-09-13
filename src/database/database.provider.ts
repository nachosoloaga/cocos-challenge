import { Provider } from '@nestjs/common';
import { Kysely } from 'kysely';
import {  createDatabase } from './database.config';
import { ConfigService } from '@nestjs/config';
import { DB } from './database-types';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export const databaseProvider: Provider = {
  provide: DATABASE_CONNECTION,
  useFactory: (configService: ConfigService): Kysely<DB> => {
    return createDatabase(configService);
  },
};

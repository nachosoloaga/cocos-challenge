import { Module } from '@nestjs/common';
import { databaseProvider } from './database.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [databaseProvider],
  exports: [databaseProvider],
})
export class DatabaseModule {}

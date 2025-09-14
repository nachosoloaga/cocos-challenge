import { Inject, Injectable } from '@nestjs/common';
import { MarketdataRepository } from '../domain/repositories/marketdata.repository';
import { DATABASE_CONNECTION } from 'src/database/database.provider';
import { Kysely } from 'kysely';
import { DB } from 'src/database/database-types';
import { Marketdata } from '../domain/models/marketdata';

@Injectable()
export class MarketdataRepositoryImpl implements MarketdataRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly database: Kysely<DB>,
  ) {}

  async findAll(): Promise<Marketdata[]> {
    const data = await this.database
      .selectFrom('marketdata')
      .selectAll()
      .execute();

    return data.map((item) => this.mapDbToDomain(item));
  }

  async findById(marketdataId: Marketdata['id']): Promise<Marketdata | null> {
    const data = await this.database
      .selectFrom('marketdata')
      .where('id', '=', marketdataId)
      .selectAll()
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.mapDbToDomain(data);
  }

  private mapDbToDomain(data: Record<string, unknown>) {
    return Marketdata.fromDb({
      id: data.id as number,
      instrumentid: data.instrumentid as number,
      high: data.high as number,
      low: data.low as number,
      open: data.open as number,
      close: data.close as number,
      previousclose: data.previousclose as number,
      date: data.date as Date,
    });
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { MarketdataRepository } from '../domain/repositories/marketdata.repository';
import { DATABASE_CONNECTION } from 'src/database/database.provider';
import { Kysely, SelectQueryBuilder } from 'kysely';
import { DB } from 'src/database/database-types';
import { Marketdata } from '../domain/models/marketdata';
import { MarketdataQueryObject } from '../domain/queries/marketdata.query-object';

@Injectable()
export class MarketdataRepositoryImpl implements MarketdataRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly database: Kysely<DB>,
  ) {}

  async find(query: MarketdataQueryObject): Promise<Marketdata[]> {
    const qb = this.buildQuery(query);

    const data = await qb.selectAll().execute();

    return data.map((item) => this.mapDbToDomain(item));
  }

  async findOne(query: MarketdataQueryObject): Promise<Marketdata | null> {
    const qb = this.buildQuery(query);

    const data = await qb.selectAll().executeTakeFirst();

    return data ? this.mapDbToDomain(data) : null;
  }

  private buildQuery(
    query: MarketdataQueryObject,
  ): SelectQueryBuilder<DB, 'marketdata', unknown> {
    let qb = this.database.selectFrom('marketdata');

    if (query.date) {
      qb = qb.where('date', '=', query.date);
    }

    if (query.instrumentId) {
      qb = qb.where('instrumentid', '=', query.instrumentId);
    }

    if (query.sort) {
      qb = qb.orderBy(query.sort.field, query.sort.type);
    }

    return qb;
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
      date: data.date as string,
    });
  }
}

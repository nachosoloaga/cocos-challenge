import { Inject, Injectable } from '@nestjs/common';
import { InstrumentRepository } from '../domain/repositories/instrument.repository';
import { DATABASE_CONNECTION } from 'src/database/database.provider';
import { Kysely, SelectQueryBuilder } from 'kysely';
import { DB } from 'src/database/database-types';
import { Instrument } from '../domain/models/instrument';
import { InstrumentQueryObject } from '../domain/queries/instrument.query-object';

@Injectable()
export class InstrumentRepositoryImpl implements InstrumentRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly database: Kysely<DB>,
  ) {}

  async find(query: InstrumentQueryObject): Promise<Instrument[]> {
    const qb = this.buildQuery(query);

    const data = await qb.selectAll().execute();

    console.log(data);

    return data.map((item) => this.mapDbToDomain(item));
  }

  async findOne(query: InstrumentQueryObject): Promise<Instrument | null> {
    const qb = this.buildQuery(query);

    const data = await qb.selectAll().executeTakeFirst();

    return data ? this.mapDbToDomain(data) : null;
  }

  private buildQuery(
    query: InstrumentQueryObject,
  ): SelectQueryBuilder<DB, 'instruments', unknown> {
    let qb = this.database.selectFrom('instruments');

    if (query.ticker) {
      const tickerUpperCase = query.ticker.toUpperCase();
      qb = qb.where('ticker', '=', tickerUpperCase);
    }

    if (query.name) {
      const nameUpperCase = query.name.toUpperCase();
      qb = qb.where('name', '=', nameUpperCase);
    }

    return qb;
  }

  private mapDbToDomain(data: Record<string, unknown>) {
    return Instrument.fromDb({
      id: data.id as number,
      ticker: data.ticker as string,
      name: data.name as string,
      type: data.type as string,
    });
  }
}

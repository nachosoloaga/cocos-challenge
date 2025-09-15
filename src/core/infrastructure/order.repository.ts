import { Inject, Injectable } from '@nestjs/common';
import { OrderRepository } from '../domain/repositories/order.repository';
import { DATABASE_CONNECTION } from 'src/database/database.provider';
import { Kysely, SelectQueryBuilder } from 'kysely';
import { DB } from 'src/database/database-types';
import { Order } from '../domain/models/order';
import { Side } from '../domain/types/enums';
import { OrderQueryObject } from '../domain/queries/order.query-object';

@Injectable()
export class OrderRepositoryImpl implements OrderRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly database: Kysely<DB>,
  ) {}

  async find(query: OrderQueryObject): Promise<Order[]> {
    const qb = this.buildQuery(query);
    const data = await qb.selectAll().execute();

    return data.map((item) => this.mapDbToDomain(item));
  }

  private buildQuery(
    query: OrderQueryObject,
  ): SelectQueryBuilder<DB, 'orders', unknown> {
    let qb = this.database.selectFrom('orders');

    if (query.userId) {
      qb = qb.where('userid', '=', query.userId);
    }

    if (query.instrumentId) {
      qb = qb.where('instrumentid', '=', query.instrumentId);
    }

    if (query.side) {
      qb = qb.where('side', '=', query.side);
    }

    if (query.status) {
      qb = qb.where('status', '=', query.status);
    }

    return qb;
  }

  private mapDbToDomain(data: Record<string, unknown>) {
    return Order.fromDb({
      id: data.id as number,
      instrumentid: data.instrumentid as number,
      userid: data.userid as number,
      side: data.side as Side,
      size: data.size as number,
      price: data.price as number,
      type: data.type as string,
      status: data.status as string,
      datetime: data.datetime as Date,
    });
  }
}

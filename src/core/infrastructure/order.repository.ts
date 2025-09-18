import { Inject, Injectable } from '@nestjs/common';
import { OrderRepository } from '../domain/repositories/order.repository';
import { DATABASE_CONNECTION } from '../../database/database.provider';
import { Kysely, SelectQueryBuilder } from 'kysely';
import { DB } from '../../database/database-types';
import { Order } from '../domain/models/order';
import { OrderStatus, Side } from '../domain/types/enums';
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

  async findOne(query: OrderQueryObject): Promise<Order | null> {
    const qb = this.buildQuery(query);
    const data = await qb.selectAll().executeTakeFirst();

    return data ? this.mapDbToDomain(data) : null;
  }

  private buildQuery(
    query: OrderQueryObject,
  ): SelectQueryBuilder<DB, 'orders', unknown> {
    let qb = this.database.selectFrom('orders');

    if (query.id) {
      qb = qb.where('id', '=', query.id);
    }

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

  async save(order: Order): Promise<number> {
    const dbOrder = this.mapDomainToDb(order);

    const result = await this.database
      .insertInto('orders')
      .values(dbOrder)
      .returning('id')
      .execute();

    return result[0].id;
  }

  async update(order: Order): Promise<number> {
    const dbOrder = this.mapDomainToDb(order);
    const result = await this.database
      .updateTable('orders')
      .set(dbOrder)
      .where('id', '=', order.id)
      .returning('id')
      .execute();

    return result[0].id;
  }

  private mapDomainToDb(order: Order): Record<string, unknown> {
    return {
      instrumentid: order.instrumentId,
      userid: order.userId,
      side: order.side,
      size: order.size,
      price: order.price,
      type: order.type,
      status: order.status,
      datetime: order.datetime,
    };
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
      status: data.status as OrderStatus,
      datetime: data.datetime as Date,
    });
  }
}

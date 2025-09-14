import { Inject, Injectable } from '@nestjs/common';
import { OrderRepository } from '../domain/repositories/order.repository';
import { DATABASE_CONNECTION } from 'src/database/database.provider';
import { Kysely } from 'kysely';
import { DB } from 'src/database/database-types';
import { Order } from '../domain/models/order';
import { Side } from '../domain/types/enums';

@Injectable()
export class OrderRepositoryImpl implements OrderRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly database: Kysely<DB>,
  ) {}

  async findAll(): Promise<Order[]> {
    const data = await this.database.selectFrom('orders').selectAll().execute();

    return data.map((item) => this.mapDbToDomain(item));
  }

  async findById(orderId: Order['id']): Promise<Order | null> {
    const data = await this.database
      .selectFrom('orders')
      .where('id', '=', orderId)
      .selectAll()
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.mapDbToDomain(data);
  }

  async findByUserId(userId: Order['userId']): Promise<Order[]> {
    const data = await this.database
      .selectFrom('orders')
      .where('userid', '=', userId)
      .selectAll()
      .execute();

    return data.map((item) => this.mapDbToDomain(item));
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

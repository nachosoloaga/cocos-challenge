import { Order } from '../models/order';
import { OrderQueryObject } from '../queries/order.query-object';

export interface OrderRepository {
  findOne(query: OrderQueryObject): Promise<Order | null>;
  find(query: OrderQueryObject): Promise<Order[]>;
  save(order: Order): Promise<number>;
  update(order: Order): Promise<number>;
}

export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';

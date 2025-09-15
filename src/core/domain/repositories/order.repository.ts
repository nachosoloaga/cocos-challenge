import { Order } from '../models/order';
import { OrderQueryObject } from '../queries/order.query-object';

export interface OrderRepository {
  find(query: OrderQueryObject): Promise<Order[]>;
}

export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';

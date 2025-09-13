import { Order } from '../models/order';

export interface OrderRepository {
  getOrder(orderId: Order['id']): Promise<Order | null>;
}

export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';

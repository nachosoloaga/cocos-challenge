import { Order } from '../models/order';

export interface OrderRepository {
  findAll(): Promise<Order[]>;

  findById(orderId: Order['id']): Promise<Order | null>;

  findByUserId(userId: Order['userId']): Promise<Order[]>;
}

export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';

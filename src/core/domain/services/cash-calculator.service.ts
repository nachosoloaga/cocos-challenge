import { Order } from '../models/order';

export class CashCalculatorService {
  calculateCashAmount(orders: Order[]): number {
    return orders.reduce((acc, order) => {
      return acc + order.getCashAmount();
    }, 0);
  }
}

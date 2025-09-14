import { Order } from '../models/order';
import { Side } from '../types/enums';

export class FiatCalculatorService {
  calculateFiatAmount(orders: Order[]): number {
    return orders.reduce((acc, order) => {
      if (order.side === Side.CASH_IN) {
        return acc + order.size * order.price;
      } else if (order.side === Side.CASH_OUT) {
        return acc - order.size * order.price;
      }

      return acc;
    }, 0);
  }
}

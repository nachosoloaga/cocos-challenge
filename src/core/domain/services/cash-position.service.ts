import { Order } from '../models/order';
import { Side } from '../types/enums';

export class CashPositionService {
  calculateCashPosition(orders: Order[]): number {
    let cashPosition = 0;

    for (const order of orders) {
      if (order.side === Side.CASH_IN) {
        cashPosition += order.size;
      } else if (order.side === Side.CASH_OUT) {
        cashPosition -= order.size;
      } else if (order.side === Side.BUY) {
        cashPosition -= order.size * order.price;
      } else if (order.side === Side.SELL) {
        cashPosition += order.size * order.price;
      }
    }

    return cashPosition;
  }
}

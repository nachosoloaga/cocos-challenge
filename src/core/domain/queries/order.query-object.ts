import { Side } from '../types/enums';

export class OrderQueryObject {
  constructor(
    public readonly userId?: number,
    public readonly instrumentId?: number,
    public readonly side?: Side,
    public readonly status?: string,
  ) {}

  static filledOrders(userId: number): OrderQueryObject {
    return OrderQueryObject.create({ userId, status: 'FILLED' });
  }

  static create({
    userId,
    instrumentId,
    side,
    status,
  }: {
    userId?: number;
    instrumentId?: number;
    side?: Side;
    status?: string;
  }): OrderQueryObject {
    return new OrderQueryObject(userId, instrumentId, side, status);
  }
}

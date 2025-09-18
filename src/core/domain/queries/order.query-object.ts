import { Side } from '../types/enums';

export class OrderQueryObject {
  constructor(
    public readonly userId?: number,
    public readonly instrumentId?: number,
    public readonly side?: Side,
    public readonly status?: string,
    public readonly id?: number,
  ) {}

  static filledOrders(userId: number): OrderQueryObject {
    return OrderQueryObject.create({ userId, status: 'FILLED' });
  }

  static byId(id: number): OrderQueryObject {
    return OrderQueryObject.create({ id });
  }

  static create({
    userId,
    instrumentId,
    side,
    status,
    id,
  }: {
    userId?: number;
    instrumentId?: number;
    side?: Side;
    status?: string;
    id?: number;
  }): OrderQueryObject {
    return new OrderQueryObject(userId, instrumentId, side, status, id);
  }
}

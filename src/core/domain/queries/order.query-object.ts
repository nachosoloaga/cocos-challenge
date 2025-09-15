import { Side } from '../types/enums';

export class OrderQueryObject {
  constructor(
    public readonly userId?: number,
    public readonly instrumentId?: number,
    public readonly side?: Side,
    public readonly status?: string,
  ) {}

  static filledOrdersForUser(userId: number): OrderQueryObject {
    return new OrderQueryObject(userId, undefined, undefined, 'FILLED');
  }
}

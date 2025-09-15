import { OrderType, Side } from 'src/core/domain/types/enums';

export class CreateOrderRequestDto {
  userId: number;

  instrumentId: number;

  side: Side;

  type: OrderType;

  size: number;

  price: number;

  amount: number;
}

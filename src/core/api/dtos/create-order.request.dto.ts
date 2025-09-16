import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { OrderType, Side } from 'src/core/domain/types/enums';

export class CreateOrderRequestDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  instrumentId: number;

  @IsEnum(Side)
  side: Side;

  @IsEnum(OrderType)
  type: OrderType;

  @IsNumber()
  @IsPositive()
  size: number;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  amount: number;
}

import { IsEnum, IsNumber, IsPositive, ValidateIf } from 'class-validator';
import { OrderType, Side } from '../../domain/types/enums';

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
  @ValidateIf((o: CreateOrderRequestDto) => !o.amount)
  size: number;

  @IsNumber()
  @IsPositive()
  @ValidateIf((o: CreateOrderRequestDto) => o.type === OrderType.LIMIT)
  price: number;

  @IsNumber()
  @IsPositive()
  @ValidateIf((o: CreateOrderRequestDto) => !o.size)
  amount: number;
}

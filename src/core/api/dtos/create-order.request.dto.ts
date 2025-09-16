import { IsEnum, IsNumber, IsPositive, ValidateIf } from 'class-validator';
import { OrderType, Side } from '../../domain/types/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderRequestDto {
  @IsNumber()
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  userId: number;

  @IsNumber()
  @ApiProperty({
    description: 'Instrument ID',
    example: 1,
  })
  instrumentId: number;

  @IsEnum(Side)
  @ApiProperty({
    description: 'Side of the order',
    example: Side.BUY,
  })
  side: Side;

  @IsEnum(OrderType)
  @ApiProperty({
    description: 'Type of the order',
    example: OrderType.LIMIT,
  })
  type: OrderType;

  @IsNumber()
  @IsPositive()
  @ValidateIf((o: CreateOrderRequestDto) => !o.amount)
  @ApiProperty({
    description: 'Size of the order. Not compatible with amount.',
    example: 1,
  })
  size: number;

  @IsNumber()
  @IsPositive()
  @ValidateIf((o: CreateOrderRequestDto) => o.type === OrderType.LIMIT)
  @ApiProperty({
    description: 'Price of the order. Only required for LIMIT orders.',
    example: 100,
  })
  price: number;

  @IsNumber()
  @IsPositive()
  @ValidateIf((o: CreateOrderRequestDto) => !o.size)
  @ApiProperty({
    description: 'Amount of the order. Not compatible with size.',
    example: 100,
  })
  amount: number;
}

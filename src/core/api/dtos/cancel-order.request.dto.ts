import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderRequestDto {
  @IsNumber()
  @ApiProperty({
    description: 'The ID of the order to cancel',
    example: 1,
  })
  orderId: number;
}

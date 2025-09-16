import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderResponseDto {
  @ApiProperty({
    description: 'ID of the order created',
    example: 1,
  })
  orderId: number;
}

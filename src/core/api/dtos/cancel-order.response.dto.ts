import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderResponseDto {
  @ApiProperty({
    description: 'The ID of the order that was cancelled',
    example: 1,
  })
  orderId: number;
}

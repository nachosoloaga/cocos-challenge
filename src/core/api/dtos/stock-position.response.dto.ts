import { ApiProperty } from '@nestjs/swagger';

export class StockPositionDto {
  @ApiProperty({
    description: 'Instrument ID',
    example: 1,
  })
  instrumentId: number;

  @ApiProperty({
    description: 'Quantity',
    example: 100,
  })
  quantity: number;

  @ApiProperty({
    description: 'Total return percentage',
    example: 100,
  })
  totalReturnPercentage: number;

  @ApiProperty({
    description: 'Current total value',
    example: 100,
  })
  currentTotalValue: number;
}

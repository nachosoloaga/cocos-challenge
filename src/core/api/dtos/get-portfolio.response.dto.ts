import { ApiProperty } from '@nestjs/swagger';
import { StockPositionDto } from './stock-position.response.dto';

export class GetPortfolioResponseDto {
  @ApiProperty({
    description: 'Stock positions',
  })
  stockPositions: StockPositionDto[];

  @ApiProperty({
    description: 'Total cash',
    example: 100,
  })
  totalCash: number;

  @ApiProperty({
    description: 'Total account value',
    example: 100,
  })
  totalAccountValue: number;
}

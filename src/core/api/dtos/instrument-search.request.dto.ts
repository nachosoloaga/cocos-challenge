import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsOptional } from 'class-validator';

export class InstrumentSearchDto {
  @IsAlpha()
  @IsOptional()
  @ApiProperty({
    description: 'Ticker of the instrument',
    example: 'AAPL',
  })
  ticker: string;

  @IsAlpha()
  @IsOptional()
  @ApiProperty({
    description: 'Name of the instrument',
    example: 'Apple Inc.',
  })
  name: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsOptional } from 'class-validator';

export class AssetSearchDto {
  @IsAlpha()
  @IsOptional()
  @ApiProperty({
    description: 'Ticker of the asset',
    example: 'AAPL',
  })
  ticker: string;

  @IsAlpha()
  @IsOptional()
  @ApiProperty({
    description: 'Name of the asset',
    example: 'Apple Inc.',
  })
  name: string;
}

import { IsAlpha, IsOptional } from 'class-validator';

export class AssetSearchDto {
  @IsAlpha()
  @IsOptional()
  ticker: string;

  @IsAlpha()
  @IsOptional()
  name: string;
}

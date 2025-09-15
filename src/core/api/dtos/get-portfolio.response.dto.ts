import { StockPositionDto } from './stock-position.dto';

export class GetPortfolioResponseDto {
  stockPositions: StockPositionDto[];
  totalCash: number;
  totalAccountValue: number;
}

import { StockPositionDto } from './stock-position.response.dto';

export class GetPortfolioResponseDto {
  stockPositions: StockPositionDto[];

  totalCash: number;

  totalAccountValue: number;
}

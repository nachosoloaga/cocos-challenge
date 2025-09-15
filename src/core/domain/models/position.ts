export interface StockPosition {
  instrumentId: number;
  quantity: number;
  totalCost: number;
  totalReturn: number;
  totalReturnPercentage: number;
  currentTotalValue: number;
}

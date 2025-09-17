import { Inject, Logger } from '@nestjs/common';
import { Order } from '../models/order';
import { MarketdataRepository } from '../repositories/marketdata.repository';
import { MARKETDATA_REPOSITORY } from '../repositories/marketdata.repository';
import { Side } from '../types/enums';
import { StockPosition } from '../models/position';
import { MarketdataQueryObject } from '../queries/marketdata.query-object';

export class StockPositionService {
  constructor(
    @Inject(MARKETDATA_REPOSITORY)
    private readonly marketdataRepository: MarketdataRepository,
    private readonly logger: Logger,
  ) {}

  async calculateStockPositions(orders: Order[]): Promise<StockPosition[]> {
    const positionsMap = new Map<
      number,
      {
        quantity: number;
        totalCost: number;
      }
    >();

    this.logger.log(`Calculating stock positions for ${orders.length} orders`);

    for (const order of orders) {
      const instrumentId = order.instrumentId;
      const currentPosition = positionsMap.get(instrumentId) || {
        quantity: 0,
        totalCost: 0,
      };

      if (order.side === Side.BUY) {
        currentPosition.quantity += order.size;
        currentPosition.totalCost += order.size * order.price;
      } else if (order.side === Side.SELL) {
        currentPosition.quantity -= order.size;
        currentPosition.totalCost -= order.size * order.price;
      }

      if (currentPosition.quantity > 0) {
        positionsMap.set(instrumentId, currentPosition);
      } else {
        positionsMap.delete(instrumentId);
      }
    }

    return this.addMarketData(positionsMap);
  }

  async addMarketData(
    positions: Map<number, Partial<StockPosition>>,
  ): Promise<StockPosition[]> {
    const positionsWithMarketdata: StockPosition[] = [];

    this.logger.log(`Adding marketdata for ${positions.size} positions`);

    for (const [key, position] of positions) {
      const marketdata = await this.marketdataRepository.findOne(
        MarketdataQueryObject.latestMarketdataForInstrument(key),
      );

      if (!marketdata) {
        this.logger.warn(`Marketdata not found for instrument ${key}`);
        continue;
      }

      const currentPrice = marketdata.getClose();
      const currentTotalValue = position.quantity! * currentPrice;
      const totalReturn = currentTotalValue - position.totalCost!;
      const totalReturnPercentage =
        position.totalCost! > 0
          ? Math.round((totalReturn / position.totalCost!) * 100 * 100) / 100
          : 0;

      positionsWithMarketdata.push({
        instrumentId: key,
        quantity: position.quantity!,
        totalCost: position.totalCost!,
        totalReturn,
        totalReturnPercentage,
        currentTotalValue,
      });
    }

    return positionsWithMarketdata;
  }

  public getTotalCurrentValue(positions: StockPosition[]): number {
    return positions.reduce(
      (acc, position) => acc + position.currentTotalValue,
      0,
    );
  }
}

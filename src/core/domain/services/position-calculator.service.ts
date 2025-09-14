import { Inject } from '@nestjs/common';
import { Order } from '../models/order';
import { MarketdataRepository } from '../repositories/marketdata.repository';
import { MARKETDATA_REPOSITORY } from '../repositories/marketdata.repository';
import { Side } from '../types/enums';
import { Position } from '../models/position';

export class PositionCalculatorService {
  constructor(
    @Inject(MARKETDATA_REPOSITORY)
    private readonly marketdataRepository: MarketdataRepository,
  ) {}

  async calculatePositions(orders: Order[]): Promise<Map<number, Position>> {
    const positionsMap = new Map<
      number,
      {
        quantity: number;
        totalCost: number;
        averagePrice: number;
      }
    >();

    for (const order of orders) {
      const instrumentId = order.instrumentId;
      const currentPosition = positionsMap.get(instrumentId) || {
        quantity: 0,
        totalCost: 0,
        averagePrice: 0,
      };

      if (order.side === Side.BUY) {
        currentPosition.quantity += order.size;
        currentPosition.totalCost += order.size * order.price;
      } else if (order.side === Side.SELL) {
        currentPosition.quantity -= order.size;
        currentPosition.totalCost -= order.size * order.price;
      }

      if (currentPosition.quantity > 0) {
        currentPosition.averagePrice =
          currentPosition.totalCost / currentPosition.quantity;
        positionsMap.set(instrumentId, currentPosition);
      } else {
        positionsMap.delete(instrumentId);
      }
    }

    return this.enhanceWithMarketdata(positionsMap);
  }

  async enhanceWithMarketdata(
    positions: Map<number, Partial<Position>>,
  ): Promise<Map<number, Position>> {
    const enhancedPositions = new Map<number, Position>();

    for (const [key, position] of positions) {
      // TODO: sort by date to get latest report
      const marketdata = await this.marketdataRepository.findById(key);

      if (!marketdata) {
        continue;
      }

      const currentPrice = marketdata.getClose();
      const currentTotalValue = position.quantity! * currentPrice;
      const totalReturn = currentTotalValue - position.totalCost!;
      const totalReturnPercentage =
        position.totalCost! > 0
          ? Math.round((totalReturn / position.totalCost!) * 100 * 100) / 100
          : 0;

      enhancedPositions.set(key, {
        quantity: position.quantity!,
        totalCost: position.totalCost!,
        averagePrice: position.averagePrice!,
        totalReturn,
        totalReturnPercentage,
        currentTotalValue,
      });
    }

    return enhancedPositions;
  }
}

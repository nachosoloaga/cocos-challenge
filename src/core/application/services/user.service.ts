import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/core/domain/repositories/user.repository';
import { USER_REPOSITORY } from 'src/core/domain/repositories/user.repository';
import { OrderRepository } from 'src/core/domain/repositories/order.repository';
import { ORDER_REPOSITORY } from 'src/core/domain/repositories/order.repository';
import { InstrumentRepository } from 'src/core/domain/repositories/instrument.repository';
import { INSTRUMENT_REPOSITORY } from 'src/core/domain/repositories/instrument.repository';
import { MarketdataRepository } from 'src/core/domain/repositories/marketdata.repository';
import { MARKETDATA_REPOSITORY } from 'src/core/domain/repositories/marketdata.repository';
import { FiatCalculatorService } from 'src/core/domain/services/fiat-calculator.service';
import { PositionCalculatorService } from 'src/core/domain/services/position-calculator.service';
import { Order } from 'src/core/domain/models/order';
import { Position } from 'src/core/domain/models/position';

@Injectable()
export class UserApplicationService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    @Inject(INSTRUMENT_REPOSITORY)
    private readonly instrumentRepository: InstrumentRepository,
    @Inject(MARKETDATA_REPOSITORY)
    private readonly marketdataRepository: MarketdataRepository,
    private readonly fiatCalculatorService: FiatCalculatorService,
    private readonly positionCalculatorService: PositionCalculatorService,
  ) {}

  async getPortfolio(userId: number) {
    const user = await this.userRepository.getUser(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const orders = await this.orderRepository.findByUserId(user.id);
    const totalFiatValue = this.getFiatValue(orders);
    const positionsMap = await this.getPositions(orders);
    const totalCurrentValueFromPositions =
      this.getTotalCurrentValueFromPositions(positionsMap);

    return {
      positionsMap,
      totalFiatValue,
      totalAccountValue: totalFiatValue + totalCurrentValueFromPositions,
    };
  }

  private getFiatValue(orders: Order[]): number {
    const fiatOrders = orders.filter(
      (order) => order.isFiat() && order.isFilled(),
    );

    return this.fiatCalculatorService.calculateFiatAmount(fiatOrders);
  }

  private async getPositions(orders: Order[]): Promise<Map<number, Position>> {
    const stockOrders = orders.filter(
      (order) => !order.isFiat() && order.isFilled(),
    );

    return this.positionCalculatorService.calculatePositions(stockOrders);
  }

  private getTotalCurrentValueFromPositions(
    positions: Map<number, Position>,
  ): number {
    let totalValueFromPositions = 0;
    for (const position of positions.values()) {
      totalValueFromPositions += position.currentTotalValue;
    }

    return totalValueFromPositions;
  }
}

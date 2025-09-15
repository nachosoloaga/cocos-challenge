import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/core/domain/repositories/user.repository';
import { USER_REPOSITORY } from 'src/core/domain/repositories/user.repository';
import { OrderRepository } from 'src/core/domain/repositories/order.repository';
import { ORDER_REPOSITORY } from 'src/core/domain/repositories/order.repository';
import { CashCalculatorService } from 'src/core/domain/services/cash-calculator.service';
import { PositionCalculatorService } from 'src/core/domain/services/position-calculator.service';
import { Order } from 'src/core/domain/models/order';
import { Position } from 'src/core/domain/models/position';
import { OrderQueryObject } from 'src/core/domain/queries/order.query-object';

@Injectable()
export class PortfolioApplicationService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    private readonly cashCalculatorService: CashCalculatorService,
    private readonly positionCalculatorService: PositionCalculatorService,
  ) {}

  async getPortfolio(userId: number) {
    const user = await this.userRepository.getUser(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const filledOrders = await this.orderRepository.find(
      OrderQueryObject.filledOrdersForUser(user.id),
    );
    const totalCash = this.calculateCashAmount(filledOrders);
    const positions = await this.calculatePositions(filledOrders);
    const totalCurrentValueFromPositions = this.getTotalCurrentValue(positions);

    return {
      positions,
      totalCash,
      totalAccountValue: totalCash + totalCurrentValueFromPositions,
    };
  }

  private calculateCashAmount(orders: Order[]): number {
    const cashOrders = orders.filter((order) => order.isCash());

    return this.cashCalculatorService.calculateCashAmount(cashOrders);
  }

  private async calculatePositions(orders: Order[]): Promise<Position[]> {
    const stockOrders = orders.filter((order) => order.isStock());

    return this.positionCalculatorService.calculatePositions(stockOrders);
  }

  private getTotalCurrentValue(positions: Position[]): number {
    return positions.reduce(
      (acc, position) => acc + position.currentTotalValue,
      0,
    );
  }
}

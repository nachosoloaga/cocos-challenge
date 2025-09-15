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
    const totalCashAmount = this.getCashAmount(filledOrders);
    const positionsMap = await this.getPositions(filledOrders);
    const totalCurrentValueFromPositions =
      this.getTotalCurrentValueFromPositions(positionsMap);

    return {
      positionsMap,
      totalCashAmount,
      totalAccountValue: totalCashAmount + totalCurrentValueFromPositions,
    };
  }

  private getCashAmount(orders: Order[]): number {
    const cashOrders = orders.filter((order) => order.isCash());

    return this.cashCalculatorService.calculateCashAmount(cashOrders);
  }

  private async getPositions(orders: Order[]): Promise<Map<number, Position>> {
    const stockOrders = orders.filter((order) => !order.isCash());

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

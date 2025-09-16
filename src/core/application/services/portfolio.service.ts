import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { ORDER_REPOSITORY } from '../../domain/repositories/order.repository';
import { CashCalculatorService } from '../../domain/services/cash-calculator.service';
import { StockPositionService } from '../../domain/services/stock-position.service';
import { Order } from '../../domain/models/order';
import { StockPosition } from '../../domain/models/position';
import { OrderQueryObject } from '../../domain/queries/order.query-object';

@Injectable()
export class PortfolioApplicationService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    private readonly cashCalculatorService: CashCalculatorService,
    private readonly stockPositionService: StockPositionService,
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
    const { stockPositions, totalCurrentValueFromPositions } =
      await this.calculateStockPositions(filledOrders);

    return {
      stockPositions,
      totalCash,
      totalAccountValue: totalCash + totalCurrentValueFromPositions,
    };
  }

  private calculateCashAmount(orders: Order[]): number {
    const cashOrders = orders.filter((order) => order.isCash());

    return this.cashCalculatorService.calculateCashAmount(cashOrders);
  }

  private async calculateStockPositions(orders: Order[]): Promise<{
    stockPositions: StockPosition[];
    totalCurrentValueFromPositions: number;
  }> {
    const stockOrders = orders.filter((order) => order.isStock());

    const stockPositions =
      await this.stockPositionService.calculateStockPositions(stockOrders);

    const totalCurrentValueFromPositions =
      this.stockPositionService.getTotalCurrentValue(stockPositions);

    return { stockPositions, totalCurrentValueFromPositions };
  }
}

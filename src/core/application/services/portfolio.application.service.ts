import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { ORDER_REPOSITORY } from '../../domain/repositories/order.repository';
import { CashPositionService } from '../../domain/services/cash-position.service';
import { StockPositionService } from '../../domain/services/stock-position.service';
import { Order } from '../../domain/models/order';
import { StockPosition } from '../../domain/models/position';
import { OrderQueryObject } from '../../domain/queries/order.query-object';

@Injectable()
export class PortfolioApplicationService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    private readonly cashCalculatorService: CashPositionService,
    private readonly stockPositionService: StockPositionService,
    private readonly logger: Logger,
  ) {}

  async getPortfolio(userId: number) {
    const user = await this.userRepository.getUser(userId);

    if (!user) {
      this.logger.error(`User not found for id ${userId}`);

      throw new NotFoundException('User not found');
    }

    const filledOrders = await this.orderRepository.find(
      OrderQueryObject.filledOrders(user.id),
    );
    this.logger.log(`Found ${filledOrders.length} filled orders`);

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

    this.logger.log(`Found ${cashOrders.length} cash orders`);

    return this.cashCalculatorService.calculateCashAmount(cashOrders);
  }

  private async calculateStockPositions(orders: Order[]): Promise<{
    stockPositions: StockPosition[];
    totalCurrentValueFromPositions: number;
  }> {
    const stockOrders = orders.filter((order) => order.isStock());

    this.logger.log(`Found ${stockOrders.length} stock orders`);

    const stockPositions =
      await this.stockPositionService.calculateStockPositions(stockOrders);

    const totalCurrentValueFromPositions =
      this.stockPositionService.getTotalCurrentValue(stockPositions);

    return { stockPositions, totalCurrentValueFromPositions };
  }
}

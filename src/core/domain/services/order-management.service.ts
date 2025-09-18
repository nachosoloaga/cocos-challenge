import { OrderType, Side } from '../types/enums';
import { OrderQueryObject } from '../queries/order.query-object';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../repositories/order.repository';
import { Inject, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { CashPositionService } from './cash-position.service';
import { StockPositionService } from './stock-position.service';

export class OrderManagementService {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    private readonly cashPositionService: CashPositionService,
    private readonly stockPositionService: StockPositionService,
  ) {}

  public calculateOrderDetails({
    orderType,
    orderPrice,
    orderSize,
    orderAmount,
    marketPrice,
  }: {
    orderType: OrderType;
    orderPrice: number;
    orderSize: number;
    orderAmount: number;
    marketPrice: number;
  }): { size: number; price: number } {
    let size: number = 0;
    let price: number = 0;

    if (orderType === OrderType.MARKET) {
      price = marketPrice;
    } else {
      price = orderPrice;
    }

    if (orderSize) {
      size = orderSize;
    } else if (orderAmount) {
      size = Math.floor(orderAmount / price);
    }

    return { size, price };
  }

  public async validateOrder(
    userId: number,
    instrumentId: number,
    side: Side,
    size: number,
    price: number,
  ): Promise<void> {
    const filledOrders = await this.orderRepository.find(
      OrderQueryObject.filledOrders(userId),
    );

    if (side === Side.BUY) {
      const filledCashOrders = filledOrders.filter((order) => order.isCash());

      if (filledCashOrders.length === 0) {
        throw new NotFoundException('No funds available');
      }

      const cashPosition =
        this.cashPositionService.calculateCashPosition(filledOrders);

      const requiredAmount = size * price;

      if (cashPosition < requiredAmount) {
        throw new BadRequestException(
          `Insufficient funds. Required: $${requiredAmount}, Available: $${cashPosition}`,
        );
      }
    } else if (side === Side.SELL) {
      const sharesPosition =
        this.stockPositionService.calculateStockPositionForInstrument(
          filledOrders,
          instrumentId,
        );

      if (sharesPosition < size) {
        throw new BadRequestException(
          `Insufficient shares. Required: ${size}, Available: ${sharesPosition}`,
        );
      }
    }
  }
}

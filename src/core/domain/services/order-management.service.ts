import { OrderType, Side } from '../types/enums';
import { OrderQueryObject } from '../queries/order.query-object';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../repositories/order.repository';
import { Inject, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Order } from '../models/order';

export class OrderManagementService {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
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
      OrderQueryObject.filledOrdersForUser(userId),
    );

    if (side === Side.BUY) {
      const filledCashOrders = filledOrders.filter((order) => order.isCash());

      if (filledCashOrders.length === 0) {
        throw new NotFoundException('No funds available');
      }

      const cashPosition = this.calculateCashPosition(filledOrders);
      const requiredAmount = size * price;

      if (cashPosition < requiredAmount) {
        throw new BadRequestException(
          `Insufficient funds. Required: $${requiredAmount}, Available: $${cashPosition}`,
        );
      }
    } else if (side === Side.SELL) {
      const sharesPosition = this.calculateSharesPosition(
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

  private calculateCashPosition(orders: Order[]): number {
    let cashPosition = 0;

    for (const order of orders) {
      if (order.side === Side.CASH_IN) {
        cashPosition += order.size;
      } else if (order.side === Side.CASH_OUT) {
        cashPosition -= order.size;
      } else if (order.side === Side.BUY) {
        cashPosition -= order.size * order.price;
      } else if (order.side === Side.SELL) {
        cashPosition += order.size * order.price;
      }
    }

    return cashPosition;
  }

  private calculateSharesPosition(
    orders: Order[],
    instrumentId: number,
  ): number {
    let sharesPosition = 0;

    const instrumentOrders = orders.filter(
      (order) => order.instrumentId === instrumentId,
    );

    for (const order of instrumentOrders) {
      if (order.side === Side.BUY) {
        sharesPosition += order.size;
      } else if (order.side === Side.SELL) {
        sharesPosition -= order.size;
      }
    }

    return sharesPosition;
  }
}

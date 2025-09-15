import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from 'src/core/api/dtos/createOrder.dto';
import { Order } from 'src/core/domain/models/order';
import { InstrumentQueryObject } from 'src/core/domain/queries/instrument.query-object';
import {
  INSTRUMENT_REPOSITORY,
  InstrumentRepository,
} from 'src/core/domain/repositories/instrument.repository';
import {
  OrderRepository,
  ORDER_REPOSITORY,
} from 'src/core/domain/repositories/order.repository';
import { MARKETDATA_REPOSITORY } from 'src/core/domain/repositories/marketdata.repository';
import { MarketdataRepository } from 'src/core/domain/repositories/marketdata.repository';
import { MarketdataQueryObject } from 'src/core/domain/queries/marketdata.query-object';
import { OrderStatus, OrderType, Side } from 'src/core/domain/types/enums';
import { OrderQueryObject } from 'src/core/domain/queries/order.query-object';

@Injectable()
export class OrderApplicationService {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    @Inject(INSTRUMENT_REPOSITORY)
    private readonly instrumentRepository: InstrumentRepository,
    @Inject(MARKETDATA_REPOSITORY)
    private readonly marketdataRepository: MarketdataRepository,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<number> {
    const instrument = await this.instrumentRepository.findOne(
      InstrumentQueryObject.findById(createOrderDto.instrumentId),
    );
    if (!instrument) {
      throw new NotFoundException('Instrument not found');
    }

    const marketData = await this.marketdataRepository.findOne(
      MarketdataQueryObject.latestMarketdataForInstrument(
        createOrderDto.instrumentId,
      ),
    );
    if (!marketData) {
      throw new NotFoundException(
        'Market data not available for this instrument',
      );
    }

    const marketPrice = marketData.getClose();
    const { size, price } = this.calculateOrderDetails(
      createOrderDto,
      marketPrice,
    );

    await this.validateOrder(
      createOrderDto.userId,
      createOrderDto.instrumentId,
      createOrderDto.side,
      size,
      price,
    );

    const status =
      createOrderDto.type === OrderType.MARKET
        ? OrderStatus.FILLED
        : OrderStatus.NEW;

    const order = new Order(
      null,
      createOrderDto.instrumentId,
      createOrderDto.userId,
      createOrderDto.side,
      size,
      price,
      createOrderDto.type,
      status,
      new Date().toISOString(),
    );

    return this.orderRepository.save(order);
  }

  private calculateOrderDetails(
    createOrderDto: CreateOrderDto,
    marketPrice: number,
  ): { size: number; price: number } {
    let size: number = 0;
    let price: number = 0;

    if (createOrderDto.type === OrderType.MARKET) {
      price = marketPrice;
    } else {
      price = createOrderDto.price;
    }

    if (createOrderDto.size) {
      size = createOrderDto.size;
    } else if (createOrderDto.amount) {
      size = Math.floor(createOrderDto.amount / price);
    }

    return { size, price };
  }

  private async validateOrder(
    userId: number,
    instrumentId: number,
    side: Side,
    size: number,
    price: number,
  ): Promise<void> {
    const filledOrders = await this.orderRepository.find(
      OrderQueryObject.filledOrdersForUser(userId),
    );

    if (filledOrders.length === 0) {
      throw new NotFoundException('No filled orders found for user');
    }

    if (side === Side.BUY) {
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

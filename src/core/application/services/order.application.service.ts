import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateOrderRequestDto } from '../../api/dtos/create-order.request.dto';
import { Order } from '../../domain/models/order';
import { InstrumentQueryObject } from '../../domain/queries/instrument.query-object';
import {
  INSTRUMENT_REPOSITORY,
  InstrumentRepository,
} from '../../domain/repositories/instrument.repository';
import {
  OrderRepository,
  ORDER_REPOSITORY,
} from '../../domain/repositories/order.repository';
import { MARKETDATA_REPOSITORY } from '../../domain/repositories/marketdata.repository';
import { MarketdataRepository } from '../../domain/repositories/marketdata.repository';
import { MarketdataQueryObject } from '../../domain/queries/marketdata.query-object';
import { OrderManagementService } from '../../domain/services/order-management.service';
import { CancelOrderRequestDto } from '../../api/dtos/cancel-order.request.dto';
import { OrderQueryObject } from '../../domain/queries/order.query-object';
import { OrderStatus, OrderType } from '../../domain/types/enums';

@Injectable()
export class OrderApplicationService {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    @Inject(INSTRUMENT_REPOSITORY)
    private readonly instrumentRepository: InstrumentRepository,
    @Inject(MARKETDATA_REPOSITORY)
    private readonly marketdataRepository: MarketdataRepository,
    private readonly orderService: OrderManagementService,
    private readonly logger: Logger,
  ) {}

  async createOrder(createOrderDto: CreateOrderRequestDto): Promise<number> {
    const instrument = await this.instrumentRepository.findOne(
      InstrumentQueryObject.byId(createOrderDto.instrumentId),
    );
    if (!instrument) {
      this.logger.error(
        `Instrument not found for id ${createOrderDto.instrumentId}`,
      );
      throw new NotFoundException('Instrument not found');
    }

    const marketData = await this.marketdataRepository.findOne(
      MarketdataQueryObject.latestMarketdataForInstrument(
        createOrderDto.instrumentId,
      ),
    );
    if (!marketData) {
      this.logger.error(
        `Market data not found for instrument ${createOrderDto.instrumentId}`,
      );
      throw new NotFoundException(
        'Market data not available for this instrument',
      );
    }

    const marketPrice = marketData.close;
    const { size, price } = this.orderService.calculateOrderDetails({
      orderType: createOrderDto.type,
      orderPrice: createOrderDto.price,
      orderSize: createOrderDto.size,
      orderAmount: createOrderDto.amount,
      marketPrice,
    });

    const orderDto = { ...createOrderDto, size, price };

    this.logger.log(`Validating order for user ${createOrderDto.userId}`);

    try {
      await this.orderService.validateOrder(
        orderDto.userId,
        orderDto.instrumentId,
        orderDto.side,
        size,
        price,
      );

      const orderStatus =
        orderDto.type === OrderType.MARKET
          ? OrderStatus.FILLED
          : OrderStatus.NEW;
      const order = Order.fromDto({ ...orderDto, orderStatus });

      this.logger.log(`Saving order ${order.id}`);

      return this.orderRepository.save(order);
    } catch (error) {
      this.logger.error(
        `Error creating order for user ${orderDto.userId}: ${error}`,
      );

      const order = Order.fromDto({
        ...orderDto,
        orderStatus: OrderStatus.REJECTED,
      });

      await this.orderRepository.save(order);

      throw error;
    }
  }

  async cancelOrder(cancelOrderDto: CancelOrderRequestDto): Promise<number> {
    const order = await this.orderRepository.findOne(
      OrderQueryObject.byId(cancelOrderDto.orderId),
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.canBeCancelled()) {
      throw new UnprocessableEntityException('Order cannot be cancelled');
    }

    order.status = OrderStatus.CANCELLED;

    return this.orderRepository.update(order);
  }
}

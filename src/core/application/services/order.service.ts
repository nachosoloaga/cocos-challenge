import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderRequestDto } from 'src/core/api/dtos/create-order.request.dto';
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
import { OrderManagementService } from 'src/core/domain/services/order-management.service';

@Injectable()
export class OrderApplicationService {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    @Inject(INSTRUMENT_REPOSITORY)
    private readonly instrumentRepository: InstrumentRepository,
    @Inject(MARKETDATA_REPOSITORY)
    private readonly marketdataRepository: MarketdataRepository,
    private readonly orderService: OrderManagementService,
  ) {}

  async createOrder(createOrderDto: CreateOrderRequestDto): Promise<number> {
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
    const { size, price } = this.orderService.calculateOrderDetails({
      orderType: createOrderDto.type,
      orderPrice: createOrderDto.price,
      orderSize: createOrderDto.size,
      orderAmount: createOrderDto.amount,
      marketPrice,
    });

    await this.orderService.validateOrder(
      createOrderDto.userId,
      createOrderDto.instrumentId,
      createOrderDto.side,
      size,
      price,
    );

    createOrderDto.size = size;
    createOrderDto.price = price;

    const order = Order.fromDto(createOrderDto);

    return this.orderRepository.save(order);
  }
}

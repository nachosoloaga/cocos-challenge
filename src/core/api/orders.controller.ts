import { Controller, Post, Body } from '@nestjs/common';
import { OrderApplicationService } from '../application/services/order.service';
import { CreateOrderDto } from './dtos/createOrder.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orderApplicationService: OrderApplicationService,
  ) {}

  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<{ orderId: number }> {
    const orderId =
      await this.orderApplicationService.createOrder(createOrderDto);

    return {
      orderId,
    };
  }
}

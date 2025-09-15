import { Controller, Post, Body } from '@nestjs/common';
import { OrderApplicationService } from '../application/services/order.service';
import { CreateOrderRequestDto } from './dtos/create-order.request.dto';
import { CreateOrderResponseDto } from './dtos/create-order.response.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orderApplicationService: OrderApplicationService,
  ) {}

  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderRequestDto,
  ): Promise<CreateOrderResponseDto> {
    const orderId =
      await this.orderApplicationService.createOrder(createOrderDto);

    return {
      orderId,
    };
  }
}

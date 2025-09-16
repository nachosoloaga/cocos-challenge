import { Controller, Post, Body } from '@nestjs/common';
import { OrderApplicationService } from '../application/services/order.service';
import { CreateOrderRequestDto } from './dtos/create-order.request.dto';
import { CreateOrderResponseDto } from './dtos/create-order.response.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orderApplicationService: OrderApplicationService,
  ) {}

  @ApiOperation({
    summary: 'Create an order',
    description: 'Create a LIMIT or MARKET order ',
  })
  @ApiResponse({
    status: 200,
    description: 'Order created',
    type: CreateOrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User or instrument not found',
  })
  @ApiBody({ type: CreateOrderRequestDto })
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

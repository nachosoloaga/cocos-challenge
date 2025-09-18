import { Controller, Post, Body } from '@nestjs/common';
import { OrderApplicationService } from '../application/services/order.application.service';
import { CreateOrderRequestDto } from './dtos/create-order.request.dto';
import { CreateOrderResponseDto } from './dtos/create-order.response.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CancelOrderRequestDto } from './dtos/cancel-order.request.dto';
import { CancelOrderResponseDto } from './dtos/cancel-order.response.dto';

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

  @ApiOperation({
    summary: 'Cancel an order',
    description: 'Cancel a LIMIT order that is still NEW',
  })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled',
    type: CancelOrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 422,
    description: 'Order cannot be cancelled',
  })
  @ApiBody({ type: CancelOrderRequestDto })
  @Post('/:id/cancel')
  async cancelOrder(
    @Body() cancelOrderDto: CancelOrderRequestDto,
  ): Promise<CancelOrderResponseDto> {
    const orderId =
      await this.orderApplicationService.cancelOrder(cancelOrderDto);

    return {
      orderId,
    };
  }
}

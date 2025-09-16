import { CreateOrderRequestDto } from '../../../src/core/api/dtos/create-order.request.dto';
import { OrderType, Side } from '../../../src/core/domain/types/enums';

export class OrderFixtures {
  /**
   * Creates a valid market buy order request
   */
  static createMarketBuyOrderRequest(
    overrides: Partial<CreateOrderRequestDto> = {},
  ): CreateOrderRequestDto {
    return {
      userId: 1,
      instrumentId: 1,
      side: Side.BUY,
      type: OrderType.MARKET,
      size: 10,
      price: 0, // Market orders don't need price
      amount: 0,
      ...overrides,
    };
  }

  /**
   * Creates a valid limit buy order request
   */
  static createLimitBuyOrderRequest(
    overrides: Partial<CreateOrderRequestDto> = {},
  ): CreateOrderRequestDto {
    return {
      userId: 1,
      instrumentId: 1,
      side: Side.BUY,
      type: OrderType.LIMIT,
      size: 10,
      price: 100.5,
      amount: 0,
      ...overrides,
    };
  }

  /**
   * Creates a valid market sell order request
   */
  static createMarketSellOrderRequest(
    overrides: Partial<CreateOrderRequestDto> = {},
  ): CreateOrderRequestDto {
    return {
      userId: 1,
      instrumentId: 1,
      side: Side.SELL,
      type: OrderType.MARKET,
      size: 5,
      price: 0, // Market orders don't need price
      amount: 0,
      ...overrides,
    };
  }

  /**
   * Creates a valid order request with amount instead of size
   */
  static createOrderRequestWithAmount(
    overrides: Partial<CreateOrderRequestDto> = {},
  ): CreateOrderRequestDto {
    return {
      userId: 1,
      instrumentId: 1,
      side: Side.BUY,
      type: OrderType.MARKET,
      size: 0,
      price: 0,
      amount: 1000, // $1000 worth of shares
      ...overrides,
    };
  }

  /**
   * Creates an invalid order request with missing required fields
   */
  static createInvalidOrderRequest(): Partial<CreateOrderRequestDto> {
    return {
      userId: 1,
      // Missing instrumentId, side, type, etc.
    };
  }

  /**
   * Creates an order request for a non-existent instrument
   */
  static createOrderRequestForNonExistentInstrument(
    overrides: Partial<CreateOrderRequestDto> = {},
  ): CreateOrderRequestDto {
    return {
      userId: 1,
      instrumentId: 99999, // Non-existent instrument ID
      side: Side.BUY,
      type: OrderType.MARKET,
      size: 10,
      price: 0,
      amount: 0,
      ...overrides,
    };
  }

  /**
   * Creates an order request for a user with insufficient funds
   */
  static createOrderRequestWithInsufficientFunds(
    overrides: Partial<CreateOrderRequestDto> = {},
  ): CreateOrderRequestDto {
    return {
      userId: 2, // User with no cash position
      instrumentId: 1,
      side: Side.BUY,
      type: OrderType.MARKET,
      size: 1000, // Large order that exceeds available funds
      price: 0,
      amount: 0,
      ...overrides,
    };
  }
}

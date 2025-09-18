import { CashPositionService } from '../../src/core/domain/services/cash-position.service';
import { Order } from '../../src/core/domain/models/order';
import {
  Side,
  OrderStatus,
  OrderType,
} from '../../src/core/domain/types/enums';

describe('CashPositionService', () => {
  let service: CashPositionService;

  beforeEach(() => {
    service = new CashPositionService();
  });

  describe('calculateCashPosition', () => {
    it('should return 0 for empty orders array', () => {
      const orders: Order[] = [];
      const result = service.calculateCashPosition(orders);
      expect(result).toBe(0);
    });

    it('should handle CASH_IN orders correctly', () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.CASH_IN,
          1000,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          2,
          1,
          1,
          Side.CASH_IN,
          500,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      const result = service.calculateCashPosition(orders);
      expect(result).toBe(1500);
    });

    it('should handle CASH_OUT orders correctly', () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.CASH_OUT,
          300,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          2,
          1,
          1,
          Side.CASH_OUT,
          200,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      const result = service.calculateCashPosition(orders);
      expect(result).toBe(-500);
    });

    it('should handle BUY orders correctly', () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.BUY,
          10,
          50,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          2,
          2,
          1,
          Side.BUY,
          5,
          25,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      const result = service.calculateCashPosition(orders);
      expect(result).toBe(-625); // -(10*50 + 5*25) = -625
    });

    it('should handle SELL orders correctly', () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.SELL,
          10,
          50,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          2,
          2,
          1,
          Side.SELL,
          5,
          25,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      const result = service.calculateCashPosition(orders);
      expect(result).toBe(625); // 10*50 + 5*25 = 625
    });

    it('should handle mixed CASH_IN and CASH_OUT orders', () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.CASH_IN,
          1000,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          2,
          1,
          1,
          Side.CASH_OUT,
          300,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          3,
          1,
          1,
          Side.CASH_IN,
          200,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      const result = service.calculateCashPosition(orders);
      expect(result).toBe(900); // 1000 - 300 + 200 = 900
    });

    it('should handle mixed BUY and SELL orders', () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.BUY,
          10,
          50,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          2,
          2,
          1,
          Side.SELL,
          5,
          30,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          3,
          3,
          1,
          Side.BUY,
          3,
          20,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      const result = service.calculateCashPosition(orders);
      expect(result).toBe(-410); // -(10*50) + (5*30) - (3*20) = -500 + 150 - 60 = -410
    });

    it('should handle all order types together', () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.CASH_IN,
          2000,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          2,
          2,
          1,
          Side.BUY,
          10,
          100,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          3,
          3,
          1,
          Side.SELL,
          5,
          80,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          4,
          1,
          1,
          Side.CASH_OUT,
          500,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      const result = service.calculateCashPosition(orders);
      expect(result).toBe(900); // 2000 - (10*100) + (5*80) - 500 = 2000 - 1000 + 400 - 500 = 900
    });

    it('should handle zero values correctly', () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.CASH_IN,
          0,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          2,
          2,
          1,
          Side.BUY,
          0,
          50,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          3,
          3,
          1,
          Side.SELL,
          5,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      const result = service.calculateCashPosition(orders);
      expect(result).toBe(0); // 0 + 0 + 0 = 0
    });

    it('should handle negative cash positions', () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.CASH_OUT,
          1000,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          2,
          2,
          1,
          Side.BUY,
          10,
          50,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      const result = service.calculateCashPosition(orders);
      expect(result).toBe(-1500); // -1000 - (10*50) = -1500
    });

    it('should handle decimal values correctly', () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.CASH_IN,
          1000.5,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          2,
          2,
          1,
          Side.BUY,
          2.5,
          10.25,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          3,
          3,
          1,
          Side.SELL,
          1.5,
          15.75,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      const result = service.calculateCashPosition(orders);
      expect(result).toBe(1000.5 - 2.5 * 10.25 + 1.5 * 15.75); // 1000.50 - 25.625 + 23.625 = 998.50
    });

    it('should handle large numbers correctly', () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.CASH_IN,
          1000000,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          2,
          2,
          1,
          Side.BUY,
          1000,
          500,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      const result = service.calculateCashPosition(orders);
      expect(result).toBe(500000); // 1000000 - (1000*500) = 500000
    });

    it('should handle orders with different statuses (status should not affect calculation)', () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.CASH_IN,
          1000,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          2,
          1,
          1,
          Side.CASH_IN,
          500,
          0,
          OrderType.MARKET,
          OrderStatus.NEW,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          3,
          1,
          1,
          Side.CASH_IN,
          200,
          0,
          OrderType.MARKET,
          OrderStatus.CANCELLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      const result = service.calculateCashPosition(orders);
      expect(result).toBe(1700); // All orders are included regardless of status
    });

    it('should handle orders with different types (type should not affect calculation)', () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.CASH_IN,
          1000,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          2,
          1,
          1,
          Side.CASH_IN,
          500,
          0,
          OrderType.LIMIT,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      const result = service.calculateCashPosition(orders);
      expect(result).toBe(1500); // Type should not affect calculation
    });
  });
});

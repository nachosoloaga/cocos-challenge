import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderManagementService } from '../../src/core/domain/services/order-management.service';
import { Order } from '../../src/core/domain/models/order';
import { CashPositionService } from '../../src/core/domain/services/cash-position.service';
import { StockPositionService } from '../../src/core/domain/services/stock-position.service';
import {
  OrderRepository,
  ORDER_REPOSITORY,
} from '../../src/core/domain/repositories/order.repository';
import {
  Side,
  OrderStatus,
  OrderType,
} from '../../src/core/domain/types/enums';

describe('OrderManagementService', () => {
  let service: OrderManagementService;
  let mockOrderRepository: jest.Mocked<OrderRepository>;
  let mockCashPositionService: jest.Mocked<CashPositionService>;
  let mockStockPositionService: jest.Mocked<StockPositionService>;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const mockCashService = {
      calculateCashPosition: jest.fn(),
    };

    const mockStockService = {
      calculateStockPositionForInstrument: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderManagementService,
        {
          provide: ORDER_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: CashPositionService,
          useValue: mockCashService,
        },
        {
          provide: StockPositionService,
          useValue: mockStockService,
        },
      ],
    }).compile();

    service = module.get<OrderManagementService>(OrderManagementService);
    mockOrderRepository = module.get(ORDER_REPOSITORY);
    mockCashPositionService = module.get(CashPositionService);
    mockStockPositionService = module.get(StockPositionService);
  });

  describe('calculateOrderDetails', () => {
    it('should calculate details for MARKET order with size', () => {
      const result = service.calculateOrderDetails({
        orderType: OrderType.MARKET,
        orderPrice: 100,
        orderSize: 10,
        orderAmount: 0,
        marketPrice: 95,
      });

      expect(result).toEqual({ size: 10, price: 95 });
    });

    it('should calculate details for MARKET order with amount', () => {
      const result = service.calculateOrderDetails({
        orderType: OrderType.MARKET,
        orderPrice: 100,
        orderSize: 0,
        orderAmount: 1000,
        marketPrice: 95,
      });

      expect(result).toEqual({ size: 10, price: 95 }); // Math.floor(1000 / 95) = 10
    });

    it('should calculate details for LIMIT order with size', () => {
      const result = service.calculateOrderDetails({
        orderType: OrderType.LIMIT,
        orderPrice: 100,
        orderSize: 5,
        orderAmount: 0,
        marketPrice: 95,
      });

      expect(result).toEqual({ size: 5, price: 100 });
    });

    it('should calculate details for LIMIT order with amount', () => {
      const result = service.calculateOrderDetails({
        orderType: OrderType.LIMIT,
        orderPrice: 50,
        orderSize: 0,
        orderAmount: 500,
        marketPrice: 45,
      });

      expect(result).toEqual({ size: 10, price: 50 }); // Math.floor(500 / 50) = 10
    });

    it('should handle zero size and amount', () => {
      const result = service.calculateOrderDetails({
        orderType: OrderType.MARKET,
        orderPrice: 100,
        orderSize: 0,
        orderAmount: 0,
        marketPrice: 95,
      });

      expect(result).toEqual({ size: 0, price: 95 });
    });

    it('should handle decimal amounts correctly', () => {
      const result = service.calculateOrderDetails({
        orderType: OrderType.MARKET,
        orderPrice: 0,
        orderSize: 0,
        orderAmount: 1000.5,
        marketPrice: 33.33,
      });

      expect(result).toEqual({ size: 30, price: 33.33 }); // Math.floor(1000.50 / 33.33) = 30
    });

    it('should prioritize size over amount when both are provided', () => {
      const result = service.calculateOrderDetails({
        orderType: OrderType.MARKET,
        orderPrice: 100,
        orderSize: 5,
        orderAmount: 1000,
        marketPrice: 95,
      });

      expect(result).toEqual({ size: 5, price: 95 });
    });

    it('should handle large amounts', () => {
      const result = service.calculateOrderDetails({
        orderType: OrderType.LIMIT,
        orderPrice: 10,
        orderSize: 0,
        orderAmount: 100000,
        marketPrice: 9,
      });

      expect(result).toEqual({ size: 10000, price: 10 }); // Math.floor(100000 / 10) = 10000
    });

    it('should handle small amounts', () => {
      const result = service.calculateOrderDetails({
        orderType: OrderType.MARKET,
        orderPrice: 0,
        orderSize: 0,
        orderAmount: 50,
        marketPrice: 100,
      });

      expect(result).toEqual({ size: 0, price: 100 }); // Math.floor(50 / 100) = 0
    });
  });

  describe('validateOrder', () => {
    const mockFilledOrders = [
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
        Side.BUY,
        5,
        50,
        OrderType.MARKET,
        OrderStatus.FILLED,
        '2023-01-01T00:00:00Z',
      ),
      new Order(
        3,
        1,
        1,
        Side.SELL,
        2,
        60,
        OrderType.MARKET,
        OrderStatus.FILLED,
        '2023-01-01T00:00:00Z',
      ),
    ];

    beforeEach(() => {
      mockOrderRepository.find.mockResolvedValue(mockFilledOrders);
      mockCashPositionService.calculateCashPosition.mockReturnValue(750); // 1000 - (5*50) + (2*60)
      mockStockPositionService.calculateStockPositionForInstrument.mockReturnValue(
        3,
      ); // 5 - 2
    });

    it('should validate BUY order with sufficient funds', async () => {
      mockCashPositionService.calculateCashPosition.mockReturnValue(1000);

      await expect(
        service.validateOrder(1, 1, Side.BUY, 10, 50),
      ).resolves.not.toThrow();
    });

    it('should throw BadRequestException for BUY order with insufficient funds', async () => {
      mockCashPositionService.calculateCashPosition.mockReturnValue(400);

      await expect(
        service.validateOrder(1, 1, Side.BUY, 10, 50),
      ).rejects.toThrow(
        new BadRequestException(
          'Insufficient funds. Required: $500, Available: $400',
        ),
      );
    });

    it('should throw NotFoundException for BUY order with no cash orders', async () => {
      const ordersWithoutCash = [
        new Order(
          1,
          1,
          1,
          Side.BUY,
          5,
          50,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      mockOrderRepository.find.mockResolvedValue(ordersWithoutCash);

      await expect(
        service.validateOrder(1, 1, Side.BUY, 10, 50),
      ).rejects.toThrow(new NotFoundException('No funds available'));
    });

    it('should validate SELL order with sufficient shares', async () => {
      mockStockPositionService.calculateStockPositionForInstrument.mockReturnValue(
        10,
      );

      await expect(
        service.validateOrder(1, 1, Side.SELL, 5, 50),
      ).resolves.not.toThrow();
    });

    it('should throw BadRequestException for SELL order with insufficient shares', async () => {
      mockStockPositionService.calculateStockPositionForInstrument.mockReturnValue(
        3,
      );

      await expect(
        service.validateOrder(1, 1, Side.SELL, 5, 50),
      ).rejects.toThrow(
        new BadRequestException(
          'Insufficient shares. Required: 5, Available: 3',
        ),
      );
    });

    it('should validate SELL order with exact shares available', async () => {
      mockStockPositionService.calculateStockPositionForInstrument.mockReturnValue(
        5,
      );

      await expect(
        service.validateOrder(1, 1, Side.SELL, 5, 50),
      ).resolves.not.toThrow();
    });

    it('should handle zero size orders', async () => {
      await expect(
        service.validateOrder(1, 1, Side.BUY, 0, 50),
      ).resolves.not.toThrow();
    });

    it('should handle zero price orders', async () => {
      await expect(
        service.validateOrder(1, 1, Side.BUY, 10, 0),
      ).resolves.not.toThrow();
    });

    it('should handle decimal prices', async () => {
      mockCashPositionService.calculateCashPosition.mockReturnValue(1000);

      await expect(
        service.validateOrder(1, 1, Side.BUY, 10, 50.25),
      ).resolves.not.toThrow();
    });

    it('should handle large order sizes', async () => {
      mockCashPositionService.calculateCashPosition.mockReturnValue(1000000);

      await expect(
        service.validateOrder(1, 1, Side.BUY, 1000, 1000),
      ).resolves.not.toThrow();
    });

    it('should handle negative cash position', async () => {
      mockCashPositionService.calculateCashPosition.mockReturnValue(-100);

      await expect(
        service.validateOrder(1, 1, Side.BUY, 10, 50),
      ).rejects.toThrow(
        new BadRequestException(
          'Insufficient funds. Required: $500, Available: $-100',
        ),
      );
    });

    it('should handle negative stock position', async () => {
      mockStockPositionService.calculateStockPositionForInstrument.mockReturnValue(
        -5,
      );

      await expect(
        service.validateOrder(1, 1, Side.SELL, 10, 50),
      ).rejects.toThrow(
        new BadRequestException(
          'Insufficient shares. Required: 10, Available: -5',
        ),
      );
    });

    it('should handle CASH_IN and CASH_OUT orders in validation', async () => {
      const ordersWithCash = [
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
          200,
          0,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];
      mockOrderRepository.find.mockResolvedValue(ordersWithCash);
      mockCashPositionService.calculateCashPosition.mockReturnValue(800);

      await expect(
        service.validateOrder(1, 1, Side.BUY, 10, 50),
      ).resolves.not.toThrow();
    });

    it('should handle edge case with very small amounts', async () => {
      mockCashPositionService.calculateCashPosition.mockReturnValue(0.01);

      await expect(
        service.validateOrder(1, 1, Side.BUY, 1, 0.01),
      ).resolves.not.toThrow();
    });

    it('should handle edge case with very large amounts', async () => {
      mockCashPositionService.calculateCashPosition.mockReturnValue(1000000);

      await expect(
        service.validateOrder(1, 1, Side.BUY, 1000, 1000),
      ).resolves.not.toThrow();
    });
  });
});

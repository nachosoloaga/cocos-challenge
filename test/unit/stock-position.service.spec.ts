import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { StockPositionService } from '../../src/core/domain/services/stock-position.service';
import { Order } from '../../src/core/domain/models/order';
import { Marketdata } from '../../src/core/domain/models/marketdata';
import { StockPosition } from '../../src/core/domain/models/position';
import {
  Side,
  OrderStatus,
  OrderType,
} from '../../src/core/domain/types/enums';
import {
  MarketdataRepository,
  MARKETDATA_REPOSITORY,
} from '../../src/core/domain/repositories/marketdata.repository';

describe('StockPositionService', () => {
  let service: StockPositionService;
  let mockMarketdataRepository: jest.Mocked<MarketdataRepository>;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockPositionService,
        {
          provide: MARKETDATA_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockPositionService>(StockPositionService);
    mockMarketdataRepository = module.get(MARKETDATA_REPOSITORY);
  });

  describe('calculateStockPositions', () => {
    it('should return empty array for empty orders', async () => {
      const orders: Order[] = [];
      const result = await service.calculateStockPositions(orders);
      expect(result).toEqual([]);
    });

    it('should handle BUY orders correctly', async () => {
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
          1,
          1,
          Side.BUY,
          5,
          60,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];

      const mockMarketdata = new Marketdata(
        1,
        1,
        70,
        40,
        45,
        65,
        50,
        '2023-01-01T00:00:00Z',
      );
      mockMarketdataRepository.findOne.mockResolvedValue(mockMarketdata);

      const result = await service.calculateStockPositions(orders);

      expect(result).toHaveLength(1);
      expect(result[0].instrumentId).toBe(1);
      expect(result[0].quantity).toBe(15); // 10 + 5
      expect(result[0].totalCost).toBe(800); // (10*50) + (5*60)
      expect(result[0].currentTotalValue).toBe(975); // 15 * 65
      expect(result[0].totalReturn).toBe(175); // 975 - 800
      expect(result[0].totalReturnPercentage).toBe(21.88); // (175/800) * 100
    });

    it('should handle SELL orders correctly', async () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.SELL,
          5,
          70,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];

      const mockMarketdata = new Marketdata(
        1,
        1,
        80,
        60,
        65,
        75,
        70,
        '2023-01-01T00:00:00Z',
      );
      mockMarketdataRepository.findOne.mockResolvedValue(mockMarketdata);

      const result = await service.calculateStockPositions(orders);

      expect(result).toHaveLength(0); // Negative position should be removed
    });

    it('should handle mixed BUY and SELL orders', async () => {
      const orders = [
        new Order(
          1,
          1,
          1,
          Side.BUY,
          20,
          50,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          2,
          1,
          1,
          Side.SELL,
          5,
          60,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          3,
          1,
          1,
          Side.BUY,
          10,
          55,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];

      const mockMarketdata = new Marketdata(
        1,
        1,
        70,
        40,
        45,
        65,
        50,
        '2023-01-01T00:00:00Z',
      );
      mockMarketdataRepository.findOne.mockResolvedValue(mockMarketdata);

      const result = await service.calculateStockPositions(orders);

      expect(result).toHaveLength(1);
      expect(result[0].instrumentId).toBe(1);
      expect(result[0].quantity).toBe(25); // 20 - 5 + 10
      expect(result[0].totalCost).toBe(1250); // (20*50) - (5*60) + (10*55) = 1000 - 300 + 550 = 1250
      expect(result[0].currentTotalValue).toBe(1625); // 25 * 65
      expect(result[0].totalReturn).toBe(375); // 1625 - 1250
    });

    it('should handle multiple instruments', async () => {
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
          100,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];

      const mockMarketdata1 = new Marketdata(
        1,
        1,
        70,
        40,
        45,
        60,
        50,
        '2023-01-01T00:00:00Z',
      );
      const mockMarketdata2 = new Marketdata(
        2,
        2,
        120,
        80,
        90,
        110,
        100,
        '2023-01-01T00:00:00Z',
      );

      mockMarketdataRepository.findOne
        .mockResolvedValueOnce(mockMarketdata1)
        .mockResolvedValueOnce(mockMarketdata2);

      const result = await service.calculateStockPositions(orders);

      expect(result).toHaveLength(2);

      const position1 = result.find((p) => p.instrumentId === 1);
      const position2 = result.find((p) => p.instrumentId === 2);

      expect(position1?.quantity).toBe(10);
      expect(position1?.totalCost).toBe(500);
      expect(position1?.currentTotalValue).toBe(600);

      expect(position2?.quantity).toBe(5);
      expect(position2?.totalCost).toBe(500);
      expect(position2?.currentTotalValue).toBe(550);
    });

    it('should handle missing market data gracefully', async () => {
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
      ];

      mockMarketdataRepository.findOne.mockResolvedValue(null);

      const result = await service.calculateStockPositions(orders);
      expect(result).toHaveLength(0);
    });
  });

  describe('addMarketData', () => {
    it('should add market data to positions', async () => {
      const positions = new Map<number, Partial<StockPosition>>();
      positions.set(1, { quantity: 10, totalCost: 500 });
      positions.set(2, { quantity: 5, totalCost: 300 });

      const mockMarketdata1 = new Marketdata(
        1,
        1,
        70,
        40,
        45,
        60,
        50,
        '2023-01-01T00:00:00Z',
      );
      const mockMarketdata2 = new Marketdata(
        2,
        2,
        80,
        50,
        55,
        70,
        60,
        '2023-01-01T00:00:00Z',
      );

      mockMarketdataRepository.findOne
        .mockResolvedValueOnce(mockMarketdata1)
        .mockResolvedValueOnce(mockMarketdata2);

      const result = await service.addMarketData(positions);

      expect(result).toHaveLength(2);

      const position1 = result.find((p) => p.instrumentId === 1);
      const position2 = result.find((p) => p.instrumentId === 2);

      expect(position1?.currentTotalValue).toBe(600); // 10 * 60
      expect(position1?.totalReturn).toBe(100); // 600 - 500
      expect(position1?.totalReturnPercentage).toBe(20); // (100/500) * 100

      expect(position2?.currentTotalValue).toBe(350); // 5 * 70
      expect(position2?.totalReturn).toBe(50); // 350 - 300
      expect(position2?.totalReturnPercentage).toBe(16.67); // (50/300) * 100
    });
  });

  describe('getTotalCurrentValue', () => {
    it('should calculate total current value correctly', () => {
      const positions: StockPosition[] = [
        {
          instrumentId: 1,
          quantity: 10,
          totalCost: 500,
          totalReturn: 100,
          totalReturnPercentage: 20,
          currentTotalValue: 600,
        },
        {
          instrumentId: 2,
          quantity: 5,
          totalCost: 300,
          totalReturn: 50,
          totalReturnPercentage: 16.67,
          currentTotalValue: 350,
        },
      ];

      const result = service.getTotalCurrentValue(positions);
      expect(result).toBe(950); // 600 + 350
    });

    it('should return 0 for empty positions array', () => {
      const positions: StockPosition[] = [];
      const result = service.getTotalCurrentValue(positions);
      expect(result).toBe(0);
    });
  });

  describe('calculateStockPositionForInstrument', () => {
    it('should calculate position for specific instrument', () => {
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
          100,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
        new Order(
          3,
          1,
          1,
          Side.SELL,
          3,
          60,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];

      const result = service.calculateStockPositionForInstrument(orders, 1);
      expect(result).toBe(7); // 10 - 3
    });

    it('should return 0 for instrument with no orders', () => {
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
      ];

      const result = service.calculateStockPositionForInstrument(orders, 999);
      expect(result).toBe(0);
    });

    it('should handle zero position', () => {
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
          1,
          1,
          Side.SELL,
          10,
          60,
          OrderType.MARKET,
          OrderStatus.FILLED,
          '2023-01-01T00:00:00Z',
        ),
      ];

      const result = service.calculateStockPositionForInstrument(orders, 1);
      expect(result).toBe(0); // 10 - 10
    });
  });
});

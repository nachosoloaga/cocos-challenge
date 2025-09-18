import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Kysely } from 'kysely';
import { DB } from '../../src/database/database-types';
import { OrderFixtures } from './fixtures/order.fixtures';
import { DatabaseFixtures } from './fixtures/database.fixtures';
import { OrderType, Side } from '../../src/core/domain/types/enums';
import { DATABASE_CONNECTION } from '../../src/database/database.provider';
import { AppModule } from '../../src/app.module';
import { closeDatabase } from '../../src/database/database.config';

interface CreateOrderResponse {
  orderId: number;
}

interface ErrorResponse {
  message: string | string[];
}

describe('OrdersController (Integration)', () => {
  let app: INestApplication<App>;
  let db: Kysely<DB>;
  let dbFixtures: DatabaseFixtures;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    db = app.get<Kysely<DB>>(DATABASE_CONNECTION);
    dbFixtures = new DatabaseFixtures(db);
  });

  afterAll(async () => {
    await app.close();
    await closeDatabase();
  });

  describe('POST /orders', () => {
    it('should create a market buy order successfully', async () => {
      // Arrange
      const testScenario = await dbFixtures.setupCompleteTestScenario();
      const orderRequest = OrderFixtures.createMarketBuyOrderRequest({
        userId: testScenario.userId,
        instrumentId: testScenario.instrumentId,
        size: 10,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(orderRequest)
        .expect(201);

      // Assert
      const responseBody = response.body as CreateOrderResponse;
      expect(responseBody).toHaveProperty('orderId');
      expect(typeof responseBody.orderId).toBe('number');
      expect(responseBody.orderId).toBeGreaterThan(0);

      // Verify the order was saved in the database
      const savedOrder = await db
        .selectFrom('orders')
        .selectAll()
        .where('id', '=', responseBody.orderId)
        .executeTakeFirst();

      expect(savedOrder).toBeDefined();
      expect(savedOrder?.userid).toBe(testScenario.userId);
      expect(savedOrder?.instrumentid).toBe(testScenario.instrumentId);
      expect(savedOrder?.side).toBe(Side.BUY);
      expect(savedOrder?.type).toBe(OrderType.MARKET);
      expect(savedOrder?.size).toBe(10);
      expect(parseFloat(savedOrder?.price as string)).toBe(
        testScenario.marketPrice,
      );
      expect(savedOrder?.status).toBe('FILLED');
    });

    it('should create a limit buy order successfully', async () => {
      // Arrange
      const testScenario = await dbFixtures.setupCompleteTestScenario();
      const orderRequest = OrderFixtures.createLimitBuyOrderRequest({
        userId: testScenario.userId,
        instrumentId: testScenario.instrumentId,
        size: 5,
        price: 95.0, // Below market price
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(orderRequest)
        .expect(201);

      // Assert
      const responseBody = response.body as CreateOrderResponse;
      expect(responseBody).toHaveProperty('orderId');
      expect(typeof responseBody.orderId).toBe('number');

      // Verify the order was saved with limit price
      const savedOrder = await db
        .selectFrom('orders')
        .selectAll()
        .where('id', '=', responseBody.orderId)
        .executeTakeFirst();

      expect(savedOrder).toBeDefined();
      expect(parseFloat(savedOrder?.price as string)).toBe(95.0);
      expect(savedOrder?.type).toBe(OrderType.LIMIT);
      expect(savedOrder?.status).toBe('NEW'); // Limit orders start as NEW
    });

    it('should create a market sell order successfully when user has shares', async () => {
      // Arrange
      const testScenario = await dbFixtures.setupUserWithShares();
      const orderRequest = OrderFixtures.createMarketSellOrderRequest({
        userId: testScenario.userId,
        instrumentId: testScenario.instrumentId,
        size: 10,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(orderRequest)
        .expect(201);

      // Assert
      const responseBody = response.body as CreateOrderResponse;
      expect(responseBody).toHaveProperty('orderId');
      expect(typeof responseBody.orderId).toBe('number');

      // Verify the order was saved
      const savedOrder = await db
        .selectFrom('orders')
        .selectAll()
        .where('id', '=', responseBody.orderId)
        .executeTakeFirst();

      expect(savedOrder).toBeDefined();
      expect(savedOrder?.side).toBe(Side.SELL);
      expect(savedOrder?.size).toBe(10);
      expect(parseFloat(savedOrder?.price as string)).toBe(
        testScenario.marketPrice,
      );
    });

    it('should create an order with amount instead of size', async () => {
      // Arrange
      const testScenario = await dbFixtures.setupCompleteTestScenario();
      const orderRequest = OrderFixtures.createOrderRequestWithAmount({
        userId: testScenario.userId,
        instrumentId: testScenario.instrumentId,
        amount: 1000, // $1000 worth of shares
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(orderRequest)
        .expect(201);

      // Assert
      const responseBody = response.body as CreateOrderResponse;
      expect(responseBody).toHaveProperty('orderId');

      // Verify the order was saved with calculated size
      const savedOrder = await db
        .selectFrom('orders')
        .selectAll()
        .where('id', '=', responseBody.orderId)
        .executeTakeFirst();

      expect(savedOrder).toBeDefined();
      // Size should be calculated as amount / price
      const expectedSize = Math.floor(1000 / testScenario.marketPrice);
      expect(savedOrder?.size).toBe(expectedSize);
    });

    it('should return 404 when instrument does not exist', async () => {
      // Arrange
      await dbFixtures.setupCompleteTestScenario();
      const orderRequest =
        OrderFixtures.createOrderRequestForNonExistentInstrument();

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(orderRequest)
        .expect(404);

      const errorBody = response.body as ErrorResponse;
      expect(errorBody.message).toBe('Instrument not found');
    });

    it('should return 400 when user has insufficient funds', async () => {
      // Arrange
      const testScenario = await dbFixtures.setupCompleteTestScenario();
      const orderRequest =
        OrderFixtures.createOrderRequestWithInsufficientFunds({
          userId: testScenario.userId,
          instrumentId: testScenario.instrumentId,
          size: 1000, // Very large order
        });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(orderRequest)
        .expect(400);

      const errorBody = response.body as ErrorResponse;
      expect(errorBody.message).toContain('Insufficient funds');
    });

    it('should return 400 when user has insufficient shares for sell order', async () => {
      // Arrange
      const testScenario = await dbFixtures.setupUserWithShares();
      const orderRequest = OrderFixtures.createMarketSellOrderRequest({
        userId: testScenario.userId,
        instrumentId: testScenario.instrumentId,
        size: 200, // More shares than user owns
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(orderRequest)
        .expect(400);

      const errorBody = response.body as ErrorResponse;
      expect(errorBody.message).toContain('Insufficient shares');
    });

    it('should return 400 when user has no funds available', async () => {
      // Arrange
      const testScenario = await dbFixtures.setupCompleteTestScenario();

      // Create instrument and market data but no cash position for user
      await dbFixtures.createInstrument('AAPL', 'Apple Inc.');
      await dbFixtures.createMarketData(testScenario.instrumentId, 100.5);

      const orderRequest =
        OrderFixtures.createOrderRequestWithInsufficientFunds({
          userId: testScenario.userId,
          instrumentId: testScenario.instrumentId,
        });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(orderRequest)
        .expect(400);

      const errorBody = response.body as ErrorResponse;
      expect(errorBody.message).toBe(
        `Insufficient funds. Required: $100500, Available: $10000`,
      );
    });
  });
});

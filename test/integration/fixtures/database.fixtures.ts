import { Kysely } from 'kysely';
import { DB } from '../../../src/database/database-types';

export class DatabaseFixtures {
  constructor(private readonly db: Kysely<DB>) {}

  /**
   * Creates a test user with cash position
   */
  async createUserWithCashPosition(
    userId: number,
    cashAmount: number,
  ): Promise<void> {
    // First create a cash instrument (ARS currency)
    await this.db
      .insertInto('instruments')
      .values({
        id: 0,
        ticker: 'ARS',
        name: 'PESOS',
        type: 'MONEDA',
      })
      .onConflict((oc) => oc.column('id').doNothing())
      .execute();

    // Create a cash-in order to establish cash position
    await this.db
      .insertInto('orders')
      .values({
        userid: userId,
        instrumentid: 0, // Cash orders use instrument ID 0
        side: 'CASH_IN',
        size: cashAmount,
        price: 1.0,
        type: 'MARKET',
        status: 'FILLED',
        datetime: new Date().toISOString(),
      })
      .execute();
  }

  /**
   * Creates a test instrument
   */
  async createInstrument(
    id: number,
    ticker: string,
    name: string,
    type: string = 'STOCK',
  ): Promise<void> {
    await this.db
      .insertInto('instruments')
      .values({
        id,
        ticker,
        name,
        type,
      })
      .execute();
  }

  /**
   * Creates market data for an instrument
   */
  async createMarketData(
    instrumentId: number,
    close: number,
    high?: number,
    low?: number,
    open?: number,
    previousClose?: number,
  ): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .insertInto('marketdata')
      .values({
        instrumentid: instrumentId,
        high: high ?? close * 1.05,
        low: low ?? close * 0.95,
        open: open ?? close,
        close,
        previousclose: previousClose ?? close * 0.98,
        date: now,
      })
      .execute();
  }

  /**
   * Creates a filled buy order for a user (simulates having shares)
   */
  async createFilledBuyOrder(
    userId: number,
    instrumentId: number,
    size: number,
    price: number,
  ): Promise<void> {
    await this.db
      .insertInto('orders')
      .values({
        userid: userId,
        instrumentid: instrumentId,
        side: 'BUY',
        size,
        price,
        type: 'MARKET',
        status: 'FILLED',
        datetime: new Date().toISOString(),
      })
      .execute();
  }

  /**
   * Sets up a complete test scenario with user, instrument, market data, and cash position
   */
  async setupCompleteTestScenario(): Promise<{
    userId: number;
    instrumentId: number;
    cashAmount: number;
    marketPrice: number;
  }> {
    const userId = 1;
    const instrumentId = 1;
    const cashAmount = 10000; // $10,000
    const marketPrice = 100.5;

    // Create instrument
    await this.createInstrument(instrumentId, 'AAPL', 'Apple Inc.', 'STOCK');

    // Create market data
    await this.createMarketData(instrumentId, marketPrice);

    // Create user with cash position
    await this.createUserWithCashPosition(userId, cashAmount);

    return {
      userId,
      instrumentId,
      cashAmount,
      marketPrice,
    };
  }

  /**
   * Sets up a user with shares (for sell order testing)
   */
  async setupUserWithShares(): Promise<{
    userId: number;
    instrumentId: number;
    sharesOwned: number;
    marketPrice: number;
  }> {
    const userId = 1;
    const instrumentId = 1;
    const sharesOwned = 100;
    const marketPrice = 100.5;

    // Create instrument
    await this.createInstrument(instrumentId, 'AAPL', 'Apple Inc.', 'STOCK');

    // Create market data
    await this.createMarketData(instrumentId, marketPrice);

    // Create user with cash position
    await this.createUserWithCashPosition(userId, 10000);

    // Create filled buy order (user owns shares)
    await this.createFilledBuyOrder(
      userId,
      instrumentId,
      sharesOwned,
      marketPrice,
    );

    return {
      userId,
      instrumentId,
      sharesOwned,
      marketPrice,
    };
  }

  /**
   * Cleans up all test data
   */
  async cleanup(): Promise<void> {
    await this.db.deleteFrom('orders').execute();
    await this.db.deleteFrom('marketdata').execute();
    await this.db.deleteFrom('instruments').execute();
  }
}

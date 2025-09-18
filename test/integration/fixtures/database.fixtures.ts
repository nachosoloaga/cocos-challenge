import { Kysely } from 'kysely';
import { DB } from '../../../src/database/database-types';
import { faker } from '@faker-js/faker';

// These fixtures assume the initial schema migration has been run:

const CASH_INSTRUMENT_ID = 66;

export class DatabaseFixtures {
  constructor(private readonly db: Kysely<DB>) {}

  /**
   * Creates a test user with cash position
   */
  async createUserWithCashPosition(
    userId: number,
    cashAmount: number,
  ): Promise<void> {
    // Create a cash-in order to establish cash position
    await this.db
      .insertInto('orders')
      .values({
        userid: userId,
        instrumentid: CASH_INSTRUMENT_ID,
        side: 'CASH_IN',
        size: cashAmount,
        price: 1,
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
    ticker: string,
    name: string,
    type: string = 'ACCIONES',
  ): Promise<number> {
    const res = await this.db
      .insertInto('instruments')
      .values({
        ticker,
        name,
        type,
      })
      .returning('id')
      .execute();

    return res[0].id;
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
   * Creates a test user
   */
  async createUser(): Promise<number> {
    const res = await this.db
      .insertInto('users')
      .values({
        email: faker.internet.email(),
        accountnumber: faker.string.numeric(6),
      })
      .returning('id')
      .execute();

    return res[0].id;
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
    const cashAmount = 10000;
    const marketPrice = 100.5;

    const userId = await this.createUser();

    const instrumentId = await this.createInstrument(
      faker.string.alpha(4).toUpperCase(),
      faker.company.name(),
      'ACCIONES',
    );

    await this.createMarketData(instrumentId, marketPrice);

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
    const sharesOwned = 100;
    const marketPrice = 100.5;

    // Create instrument
    const instrumentId = await this.createInstrument(
      'AAPL',
      'Apple Inc.',
      'ACCIONES',
    );

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
}

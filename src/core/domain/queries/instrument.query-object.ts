export class InstrumentQueryObject {
  constructor(
    public readonly ticker?: string,
    public readonly name?: string,
  ) {}

  static searchByTickerOrName(
    ticker: string,
    name: string,
  ): InstrumentQueryObject {
    return new InstrumentQueryObject(ticker, name);
  }
}

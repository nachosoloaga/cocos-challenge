export class InstrumentQueryObject {
  constructor(
    public readonly ticker?: string,
    public readonly name?: string,
    public readonly id?: number,
  ) {}

  static searchByTickerOrName(
    ticker: string,
    name: string,
  ): InstrumentQueryObject {
    return new InstrumentQueryObject(ticker, name);
  }

  static findById(id: number): InstrumentQueryObject {
    // TODO: Improve this
    return new InstrumentQueryObject(undefined, undefined, id);
  }
}

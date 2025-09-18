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
    return InstrumentQueryObject.create({ ticker, name });
  }

  static byId(id: number): InstrumentQueryObject {
    return InstrumentQueryObject.create({ id });
  }

  static create({
    ticker,
    name,
    id,
  }: {
    ticker?: string;
    name?: string;
    id?: number;
  }): InstrumentQueryObject {
    return new InstrumentQueryObject(ticker, name, id);
  }
}

export class MarketdataQueryObject {
  constructor(
    public readonly instrumentId?: number,
    public readonly date?: Date,
    public readonly sort?: {
      type: 'desc' | 'asc';
      field: 'instrumentid' | 'date';
    },
  ) {}

  static latestMarketdataForInstrument(
    instrumentId: number,
  ): MarketdataQueryObject {
    return MarketdataQueryObject.create({
      instrumentId,
      sort: { type: 'desc', field: 'date' },
    });
  }

  static create({
    instrumentId,
    date,
    sort,
  }: {
    instrumentId?: number;
    date?: Date;
    sort?: {
      type: 'desc' | 'asc';
      field: 'instrumentid' | 'date';
    };
  }): MarketdataQueryObject {
    return new MarketdataQueryObject(instrumentId, date, sort);
  }
}

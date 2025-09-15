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
    return new MarketdataQueryObject(instrumentId, undefined, {
      type: 'desc',
      field: 'date',
    });
  }
}

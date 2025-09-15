export class MarketdataQueryObject {
  constructor(
    public readonly instrumentId?: number,
    public readonly datetime?: Date,
    public readonly sort?: {
      type: 'desc' | 'asc';
      field: 'instrumentid' | 'datetime';
    },
  ) {}

  static latestMarketdataForInstrument(
    instrumentId: number,
  ): MarketdataQueryObject {
    return new MarketdataQueryObject(instrumentId, undefined, {
      type: 'desc',
      field: 'datetime',
    });
  }
}

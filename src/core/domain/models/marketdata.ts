// - **marketdata**: id, instrumentId, high, low, open, close, previousClose, datetime
export class Marketdata {
  private _id: number;

  private _instrumentId: number;

  private _high: number;

  private _low: number;

  private _open: number;

  private _close: number;

  private _previousClose: number;

  private _datetime: string;

  constructor(
    id: number,
    instrumentId: number,
    high: number,
    low: number,
    open: number,
    close: number,
    previousClose: number,
    datetime: string,
  ) {
    this._id = id;
    this._instrumentId = instrumentId;
    this._high = high;
    this._low = low;
    this._open = open;
    this._close = close;
    this._previousClose = previousClose;
    this._datetime = datetime;
  }

  public get id(): number {
    return this._id;
  }

  public get instrumentId(): number {
    return this._instrumentId;
  }

  public get high(): number {
    return this._high;
  }

  public get low(): number {
    return this._low;
  }

  public get open(): number {
    return this._open;
  }

  public get close(): number {
    return this._close;
  }

  public get previousClose(): number {
    return this._previousClose;
  }

  public get datetime(): string {
    return this._datetime;
  }

  static fromDb({
    id,
    instrumentid,
    high,
    low,
    open,
    close,
    previousclose,
    date,
  }: {
    id: number;
    instrumentid: number;
    high: number;
    low: number;
    open: number;
    close: number;
    previousclose: number;
    date: string;
  }): Marketdata {
    return new Marketdata(
      id,
      instrumentid,
      high,
      low,
      open,
      close,
      previousclose,
      date,
    );
  }
}

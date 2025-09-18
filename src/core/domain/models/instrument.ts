export class Instrument {
  private _id: string;

  private _ticker: string;

  private _name: string;

  private _type: string;

  constructor(id: string, ticker: string, name: string, type: string) {
    this._id = id;
    this._ticker = ticker;
    this._name = name;
    this._type = type;
  }

  public get id(): string {
    return this._id;
  }

  public get ticker(): string {
    return this._ticker;
  }

  public get name(): string {
    return this._name;
  }

  public get type(): string {
    return this._type;
  }

  static fromDb({
    id,
    ticker,
    name,
    type,
  }: {
    id: number;
    ticker: string;
    name: string;
    type: string;
  }): Instrument {
    return new Instrument(id.toString(), ticker, name, type);
  }
}

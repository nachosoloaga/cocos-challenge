import { Side } from '../types/enums';

export class Order {
  private _id: number;

  private _instrumentId: number;

  private _userId: number;

  private _side: Side;

  private _size: number;

  private _price: number;

  private _type: string;

  private _status: string;

  private _datetime: string;

  constructor(
    id: number,
    instrumentId: number,
    userId: number,
    side: Side,
    size: number,
    price: number,
    type: string,
    status: string,
    datetime: string,
  ) {
    this._id = id;
    this._instrumentId = instrumentId;
    this._userId = userId;
    this._side = side;
    this._size = size;
    this._price = price;
    this._type = type;
    this._status = status;
    this._datetime = datetime;
  }

  public get id(): number {
    return this._id;
  }

  public get instrumentId(): number {
    return this._instrumentId;
  }

  public get userId(): number {
    return this._userId;
  }

  public get side(): Side {
    return this._side;
  }

  public get size(): number {
    return this._size;
  }

  public get price(): number {
    return this._price;
  }

  public get type(): string {
    return this._type;
  }

  public get status(): string {
    return this._status;
  }

  public get datetime(): string {
    return this._datetime;
  }

  public isFilled(): boolean {
    return this._status === 'FILLED';
  }

  public isFiat(): boolean {
    return this._side === Side.CASH_IN || this._side === Side.CASH_OUT;
  }

  static fromDb({
    id,
    instrumentid,
    userid,
    side,
    size,
    price,
    type,
    status,
    datetime,
  }: {
    id: number;
    instrumentid: number;
    userid: number;
    side: Side;
    size: number;
    price: number;
    type: string;
    status: string;
    datetime: Date;
  }): Order {
    return new Order(
      id,
      instrumentid,
      userid,
      side,
      size,
      Number(price),
      type,
      status,
      datetime.toISOString(),
    );
  }
}

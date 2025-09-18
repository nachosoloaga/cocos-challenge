import { CreateOrderRequestDto } from '../../api/dtos/create-order.request.dto';
import { OrderStatus, Side } from '../types/enums';

export class Order {
  private _id: number | null;

  private _instrumentId: number;

  private _userId: number;

  private _side: Side;

  private _size: number;

  private _price: number;

  private _type: string;

  private _status: OrderStatus;

  private _datetime: string;

  constructor(
    id: number | null,
    instrumentId: number,
    userId: number,
    side: Side,
    size: number,
    price: number,
    type: string,
    status: OrderStatus,
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

  public get id(): number | null {
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

  public get status(): OrderStatus {
    return this._status;
  }

  public get datetime(): string {
    return this._datetime;
  }

  public set status(status: OrderStatus) {
    this._status = status;
  }

  public isCash(): boolean {
    return this._side === Side.CASH_IN || this._side === Side.CASH_OUT;
  }

  public isStock(): boolean {
    return this._side === Side.BUY || this._side === Side.SELL;
  }

  public canBeCancelled(): boolean {
    return this._status === OrderStatus.NEW;
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
    status: OrderStatus;
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

  static fromDto(
    dto: CreateOrderRequestDto & { orderStatus: OrderStatus },
  ): Order {
    return new Order(
      null,
      dto.instrumentId,
      dto.userId,
      dto.side,
      dto.size,
      dto.price,
      dto.type,
      dto.orderStatus,
      new Date().toISOString(),
    );
  }
}

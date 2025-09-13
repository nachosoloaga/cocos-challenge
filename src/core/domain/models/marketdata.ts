// - **marketdata**: id, instrumentId, high, low, open, close, previousClose, datetime
export class Marketdata {
    private id: string;

    private instrumentId: string;

    private high: number;

    private low: number;

    private open: number;

    private close: number;

    private previousClose: number;

    private datetime: string;
    
    constructor(id: string, instrumentId: string, high: number, low: number, open: number, close: number, previousClose: number, datetime: string) {
        this.id = id;
        this.instrumentId = instrumentId;
        this.high = high;
        this.low = low;
        this.open = open;
        this.close = close;
        this.previousClose = previousClose;
        this.datetime = datetime;
    }

    public getId(): string {
        return this.id;
    }

    public getInstrumentId(): string {
        return this.instrumentId;
    }
    
    public getHigh(): number {
        return this.high;
    }

    public getLow(): number {
        return this.low;
    }
    
    public getOpen(): number {
        return this.open;
    }

    public getClose(): number {
        return this.close;
    }
    
    public getPreviousClose(): number {
        return this.previousClose;
    }

    public getDatetime(): string {
        return this.datetime;
    }

    static fromDb({
        id,
        instrumentid,
        high,
        low,
        open,
        close,
        previousclose,
        date
    }: {
        id: number;
        instrumentid: number;
        high: number;
        low: number;
        open: number;
        close: number;
        previousclose: number;
        date: Date;
    }): Marketdata {
        return new Marketdata(
            id.toString(),
            instrumentid.toString(),
            Number(high),
            Number(low),
            Number(open),
            Number(close),
            Number(previousclose),
            date.toISOString()
        );
    }
}

export class Order {
    private id: string;

    private instrumentId: string;
    
    private userId: string;
    
    private side: string;
    
    private size: number;
    
    private price: number;
    
    private type: string;
    
    private status: string;
    
    private datetime: string;

    constructor(id: string, instrumentId: string, userId: string, side: string, size: number, price: number, type: string, status: string, datetime: string) {
        this.id = id;
        this.instrumentId = instrumentId;
        this.userId = userId;
        this.side = side;
        this.size = size;
        this.price = price;
        this.type = type;
    }

    public getId(): string {
        return this.id;
    }

    public getInstrumentId(): string {
        return this.instrumentId;
    }

    public getUserId(): string {
        return this.userId;
    }

    public getSide(): string {
        return this.side;
    }

    public getSize(): number {
        return this.size;
    }

    public getPrice(): number {
        return this.price;
    }

    public getType(): string {
        return this.type;
    }

    public getStatus(): string {
        return this.status;
    }

    public getDatetime(): string {
        return this.datetime;
    }
}
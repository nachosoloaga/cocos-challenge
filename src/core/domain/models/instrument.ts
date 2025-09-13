export class Instrument {
    private id: string;

    private ticker: string;

    private name: string;
    
    private type: string;

    constructor(id: string, ticker: string, name: string, type: string) {
        this.id = id;
        this.ticker = ticker;
        this.name = name;
        this.type = type;
    }
    
    public getId(): string {
        return this.id;
    }

    public getTicker(): string {
        return this.ticker;
    }
    
    public getName(): string {
        return this.name;
    }

    public getType(): string {
        return this.type;
    }

    static fromDb({
        id,
        ticker,
        name,
        type
    }: {
        id: number;
        ticker: string;
        name: string;
        type: string;
    }): Instrument {
        return new Instrument(id.toString(), ticker, name, type);
    }
}
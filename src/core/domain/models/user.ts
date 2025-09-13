export class User {
    private id: string;

    private email: string;

    private accountNumber: string;

    constructor(id: string, email: string, accountNumber: string) {
        this.id = id;
        this.email = email;
        this.accountNumber = accountNumber;
    }

    public getId(): string {
        return this.id;
    }

    public getEmail(): string {
        return this.email;
    }

    public getAccountNumber(): string {
        return this.accountNumber;
    }
}
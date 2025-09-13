import { DB } from 'src/database/database-types';

export class User {
  private id: number;

  private email: string;

  private accountNumber: number;

  constructor(id: number, email: string, accountNumber: number) {
    this.id = id;
    this.email = email;
    this.accountNumber = accountNumber;
  }

  public getId(): number {
    return this.id;
  }

  public getEmail(): string {
    return this.email;
  }

  public getAccountNumber(): number {
    return this.accountNumber;
  }

  static fromDb({
    id,
    email,
    accountnumber,
  }: {
    id: number;
    email: string;
    accountnumber: number;
  }): User {
    return new User(id, email, accountnumber);
  }
}

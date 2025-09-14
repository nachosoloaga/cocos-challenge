export class User {
  private _id: number;

  private _email: string;

  private _accountNumber: number;

  constructor(id: number, email: string, accountNumber: number) {
    this._id = id;
    this._email = email;
    this._accountNumber = accountNumber;
  }

  public get id(): number {
    return this._id;
  }

  public get email(): string {
    return this._email;
  }

  public get accountNumber(): number {
    return this._accountNumber;
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

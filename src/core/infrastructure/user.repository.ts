import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../domain/repositories/user.repository';
import { DATABASE_CONNECTION } from '../../database/database.provider';
import { Kysely } from 'kysely';
import { DB } from '../../database/database-types';
import { User } from '../domain/models/user';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly database: Kysely<DB>,
  ) {}

  async getUser(userId: User['id']): Promise<User | null> {
    const data = await this.database
      .selectFrom('users')
      .where('id', '=', userId)
      .selectAll()
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.mapDbToDomain(data);
  }

  private mapDbToDomain(data: Record<string, unknown>) {
    return User.fromDb({
      id: data.id as number,
      email: data.email as string,
      accountnumber: data.accountnumber as number,
    });
  }
}

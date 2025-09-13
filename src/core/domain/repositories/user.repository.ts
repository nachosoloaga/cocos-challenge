import { User } from '../models/user';

export interface UserRepository {
  getUser(userId: User['id']): Promise<User | null>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';

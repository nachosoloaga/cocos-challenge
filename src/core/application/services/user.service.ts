import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "src/core/domain/repositories/user.repository";
import { USER_REPOSITORY } from "src/core/domain/repositories/user.repository";

@Injectable()
export class UserApplicationService {
    constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {
    }

    async getPortfolio(userId: number) {
        const user = await this.userRepository.getUser(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }
    }
}
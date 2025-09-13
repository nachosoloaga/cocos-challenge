import { Controller, Get, Param } from "@nestjs/common";
import { UserApplicationService } from "../application/services/user.service";

@Controller('users')
export class UserController {
    constructor(private readonly userApplicationService: UserApplicationService) {}

    @Get(':id/portfolio')
    async getPortfolio(@Param('id') id: number) {
        await this.userApplicationService.getPortfolio(id);
    }
}